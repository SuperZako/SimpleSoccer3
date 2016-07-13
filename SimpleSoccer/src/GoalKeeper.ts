/**
 * Desc:   class to implement a goalkeeper agent
 * 
 * @author Petr (http://www.sallyx.org/)
 */

/// <reference path="./PlayerBase.ts" />

/// <reference path="./GoalKeeperStates/GlobalKeeperState.ts" />


namespace SimpleSoccer {
    export class GoalKeeper extends PlayerBase {
        //    //an instance of the state machine class

        private stateMachine: StateMachine<GoalKeeper>;
        //    //this vector is updated to point towards the ball and is used when
        //    //rendering the goalkeeper (instead of the underlaying vehicle's heading)
        //    //to ensure he always appears to be watching the ball
        private lookAt = new Vector2();

        //----------------------------- ctor ------------------------------------
        //-----------------------------------------------------------------------
        public constructor(home_team: SoccerTeam,
            home_region: number,
            start_state: State<GoalKeeper>,
            heading: Vector2,
            velocity: Vector2,
            mass: number,
            max_force: number,
            max_speed: number,
            max_turn_rate: number,
            scale: number) {
            super(home_team, home_region, heading, velocity, mass, max_force, max_speed, max_turn_rate, scale, PlayerRole.GoalKeeper);


            //set up the state machine
            this.stateMachine = new StateMachine<GoalKeeper>(this);

            this.stateMachine.SetCurrentState(start_state);
            this.stateMachine.SetPreviousState(start_state);
            this.stateMachine.SetGlobalState(GlobalKeeperState.Instance());

            this.stateMachine.CurrentState().Enter(this);
        }

        //    @Override
        //    protected void finalize() throws Throwable {
        //        super.finalize();
        //        m_pStateMachine = null;
        //    }

        //    //these must be implemented
        public Update() {
            //run the logic for the current state
            this.stateMachine.Update();

            //calculate the combined force from each steering behavior 
            let SteeringForce = this.m_pSteering.Calculate();

            //Acceleration = Force/Mass
            let Acceleration = Vector2.divide(SteeringForce, this.m_dMass);
            //update velocity
            this.m_vVelocity.add(Acceleration);

            //make sure player does not exceed maximum velocity
            this.m_vVelocity.Truncate(this.m_dMaxSpeed);

            //update the position
            this.position.add(this.m_vVelocity);


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
                this.lookAt = Vec2DNormalize(Vector2.subtract(this.Ball().Pos(), this.Pos()));
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
            return this.stateMachine.HandleMessage(msg);
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

            return new Vector2(xPosTarget, yPosTarget);
        }

        //public GetFSM() {
        //    return this.m_pStateMachine;
        //}

        public ChangeState(state: State<GoalKeeper>) {
            this.stateMachine.ChangeState(state);
        }

        public LookAt() {
            return new Vector2(this.lookAt.x, this.lookAt.y);
        }

        public SetLookAt(v: Vector2) {
            this.lookAt = new Vector2(v.x, v.y);
        }
    }
}