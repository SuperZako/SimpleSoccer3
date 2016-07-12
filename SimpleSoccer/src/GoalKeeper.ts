/**
 * Desc:   class to implement a goalkeeper agent
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer;

//import SimpleSoccer.GoalKeeperStates.GlobalKeeperState;
//import common.Messaging.Telegram;
//import common.misc.AutoList;
//import common.D2.Vector2D;
//import static common.D2.Vector2D.*;
//import static common.D2.Transformation.WorldTransform;
//import common.FSM.State;
//import common.FSM.StateMachine;
//import static common.misc.Cgdi.gdi;
//import static common.misc.Stream_Utility_function.ttos;
//import static common.Game.EntityFunctionTemplates.EnforceNonPenetrationContraint;
//import static SimpleSoccer.ParamLoader.Prm;
namespace SimpleSoccer {
    export class GoalKeeper extends PlayerBase {
        //    //an instance of the state machine class

        private m_pStateMachine: StateMachine<GoalKeeper>;
        //    //this vector is updated to point towards the ball and is used when
        //    //rendering the goalkeeper (instead of the underlaying vehicle's heading)
        //    //to ensure he always appears to be watching the ball
        private m_vLookAt = new Vector2D();

        //----------------------------- ctor ------------------------------------
        //-----------------------------------------------------------------------
        public constructor(home_team: SoccerTeam,
            home_region: number,
            start_state: State<GoalKeeper>,
            heading: Vector2D,
            velocity: Vector2D,
            mass: number,
            max_force: number,
            max_speed: number,
            max_turn_rate: number,
            scale: number) {
            super(home_team, home_region, heading, velocity, mass, max_force, max_speed, max_turn_rate, scale, player_role.goal_keeper);


            //set up the state machine
            this.m_pStateMachine = new StateMachine<GoalKeeper>(this);

            this.m_pStateMachine.SetCurrentState(start_state);
            this.m_pStateMachine.SetPreviousState(start_state);
            this.m_pStateMachine.SetGlobalState(GlobalKeeperState.Instance());

            this.m_pStateMachine.CurrentState().Enter(this);
        }

        //    @Override
        //    protected void finalize() throws Throwable {
        //        super.finalize();
        //        m_pStateMachine = null;
        //    }

        //    //these must be implemented
        public Update() {
            //run the logic for the current state
            this.m_pStateMachine.Update();

            //calculate the combined force from each steering behavior 
            let SteeringForce = this.m_pSteering.Calculate();

            //Acceleration = Force/Mass
            let Acceleration = div(SteeringForce, this.m_dMass);
            //update velocity
            this.m_vVelocity.add(Acceleration);

            //make sure player does not exceed maximum velocity
            this.m_vVelocity.Truncate(this.m_dMaxSpeed);

            //update the position
            this.m_vPosition.add(this.m_vVelocity);


            //enforce a non-penetration constraint if desired
            if (ParamLoader.bNonPenetrationConstraint) {
                EnforceNonPenetrationContraint(this, /*new AutoList<PlayerBase>()*/PlayerBase.GetAllMembers());
            }

            //update the heading if the player has a non zero velocity
            if (!this.m_vVelocity.isZero()) {
                this.m_vHeading = Vec2DNormalize(this.m_vVelocity);
                this.m_vSide = this.m_vHeading.Perp();
            }

            //look-at vector always points toward the ball
            if (!this.Pitch().GoalKeeperHasBall()) {
                this.m_vLookAt = Vec2DNormalize(sub(this.Ball().Pos(), this.Pos()));
            }
        }

        ////--------------------------- Render -------------------------------------
        ////
        ////------------------------------------------------------------------------
        //    @Override
        public Render(ctx: CanvasRenderingContext2D) {
            //        if (Team().Color() == SoccerTeam.blue) {
            //            gdi.BluePen();
            //        } else {
            //            gdi.RedPen();
            //        }

            //        m_vecPlayerVBTrans = WorldTransform(m_vecPlayerVB,
            //                Pos(),
            //                m_vLookAt,
            //                m_vLookAt.Perp(),
            //                Scale());

            //        gdi.ClosedShape(m_vecPlayerVBTrans);

            //        //draw the head
            //        gdi.BrownBrush();
            //        gdi.Circle(Pos(), 6);
            ctx.beginPath();
            ctx.fillStyle = "rgb(0, 0, 0)"; // black
            ctx.arc(this.Pos().x, this.Pos().y, 6, 0, Math.PI * 2, false);
            ctx.fill();
            //        //draw the ID
            //        if (Prm.bIDs) {
            //            gdi.TextColor(0, 170, 0);;
            //            gdi.TextAtPos(Pos().x - 20, Pos().y - 25, ttos(ID()));
            //        }

            //        //draw the state
            //        if (Prm.bStates) {
            //            gdi.TextColor(0, 170, 0);
            //            gdi.TransparentText();
            //            gdi.TextAtPos(m_vPosition.x, m_vPosition.y - 25,
            //                    new String(m_pStateMachine.GetNameOfCurrentState()));
            //        }
        }

        /**
         * routes any messages appropriately
         */
        //@Override
        public HandleMessage(msg: Telegram) {
            return this.m_pStateMachine.HandleMessage(msg);
        }

        /**
         * @return true if the ball comes close enough for the keeper to 
         *         consider intercepting
         */
        public BallWithinRangeForIntercept() {
            return (Vec2DDistanceSq(this.Team().HomeGoal().Center(), this.Ball().Pos()) <= ParamLoader.GoalKeeperInterceptRangeSq);
        }

        /**
         * @return true if the keeper has ventured too far away from the goalmouth
         */
        public TooFarFromGoalMouth() {
            return (Vec2DDistanceSq(this.Pos(), this.GetRearInterposeTarget()) > ParamLoader.GoalKeeperInterceptRangeSq);
        }

        /**
         * this method is called by the Intercept state to determine the spot
         * along the goalmouth which will act as one of the interpose targets
         * (the other is the ball).
         * the specific point at the goal line that the keeper is trying to cover
         * is flexible and can move depending on where the ball is on the field.
         * To achieve this we just scale the ball's y value by the ratio of the
         * goal width to playingfield width
         */
        public GetRearInterposeTarget() {
            let goalWidth = ParamLoader.GoalWidth;
            let playingArea = this.Pitch().PlayingArea();
            let xPosTarget = this.Team().HomeGoal().Center().x;

            let yPosTarget = playingArea.Center().y - goalWidth * 0.5 + (this.Ball().Pos().y * goalWidth) / playingArea.Height();

            return new Vector2D(xPosTarget, yPosTarget);
        }

        //public GetFSM() {
        //    return this.m_pStateMachine;
        //}

        public ChangeState(state: State<GoalKeeper>) {
            return this.m_pStateMachine.ChangeState(state);
        }

        public LookAt() {
            return new Vector2D(this.m_vLookAt.x, this.m_vLookAt.y);
        }

        public SetLookAt(v: Vector2D) {
            this.m_vLookAt = new Vector2D(v.x, v.y);
        }
    }
}