/// <reference path="./FieldPlayerStates/GlobalPlayerState.ts" />

/// <reference path="./PlayerBase.ts" />

/**
 *   Desc:   Derived from a PlayerBase, this class encapsulates a player
 *           capable of moving around a soccer pitch, kicking, dribbling,
 *           shooting etc
 * 
 * @author Petr (http://www.sallyx.org/)
 */


namespace SimpleSoccer {
    export class FieldPlayer extends PlayerBase {
        //an instance of the state machine class

        private m_pStateMachine: StateMachine<FieldPlayer>;
        //limits the number of kicks a player may take per second
        private m_pKickLimiter: Regulator;

        //----------------------------- ctor -------------------------------------
        constructor(home_team: SoccerTeam,
            home_region: number,
            start_state: State<FieldPlayer>,
            heading: Vector2,
            velocity: Vector2,
            mass: number,
            max_force: number,
            max_speed: number,
            max_turn_rate: number,
            scale: number,
            role: PlayerRole) {
            super(home_team, home_region, heading, velocity, mass, max_force, max_speed, max_turn_rate, scale, role);

            //set up the state machine
            this.m_pStateMachine = new StateMachine<FieldPlayer>(this);

            if (start_state != null) {
                this.m_pStateMachine.SetCurrentState(start_state);
                this.m_pStateMachine.SetPreviousState(start_state);
                this.m_pStateMachine.SetGlobalState(GlobalPlayerState.Instance());

                this.m_pStateMachine.CurrentState().Enter(this);
            }

            this.m_pSteering.SeparationOn();

            //set up the kick regulator
            this.m_pKickLimiter = new Regulator(ParamLoader.PlayerKickFrequency);
        }

        //    //------------------------------- dtor ---------------------------------------
        ////----------------------------------------------------------------------------
        //    @Override
        //    protected void finalize() throws Throwable {
        //        super.finalize();
        //        m_pKickLimiter = null;
        //        m_pStateMachine = null;
        //    }

        /**
         * call this to update the player's position and orientation
         */
        public Update() {
            //run the logic for the current state
            this.m_pStateMachine.Update();

            //calculate the combined steering force
            this.m_pSteering.Calculate();

            //if no steering force is produced decelerate the player by applying a
            //braking force
            if (this.m_pSteering.Force().isZero()) {
                const BrakingRate = 0.8;

                this.m_vVelocity.multiply(BrakingRate);
            }

            //the steering force's side component is a force that rotates the 
            //player about its axis. We must limit the rotation so that a player
            //can only turn by PlayerMaxTurnRate rads per update.
            let TurningForce = this.m_pSteering.SideComponent();

            TurningForce = clamp(TurningForce, -ParamLoader.PlayerMaxTurnRate, ParamLoader.PlayerMaxTurnRate);

            //rotate the heading vector
            Vec2DRotateAroundOrigin(this.m_vHeading, TurningForce);

            //make sure the velocity vector points in the same direction as
            //the heading vector
            this.m_vVelocity = Vector2.multiply(this.m_vVelocity.length(), this.m_vHeading);

            //and recreate m_vSide
            this.m_vSide = this.m_vHeading.Perp();


            //now to calculate the acceleration due to the force exerted by
            //the forward component of the steering force in the direction
            //of the player's heading
            let accel = Vector2.multiply(this.m_pSteering.ForwardComponent() / this.m_dMass, this.m_vHeading);

            this.m_vVelocity.add(accel);

            //make sure player does not exceed maximum velocity
            this.m_vVelocity.Truncate(this.m_dMaxSpeed);
            //update the position
            this.position.add(this.m_vVelocity);

            //enforce a non-penetration constraint if desired
            if (ParamLoader.bNonPenetrationConstraint) {
                EnforceNonPenetrationContraint(this, /*new AutoList<PlayerBase>().GetAllMembers()*/PlayerBase.GetAllMembers());
            }
        }

        //--------------------------- Render -------------------------------------
        //
        //------------------------------------------------------------------------
        //    @Override
        public Render(ctx: CanvasRenderingContext2D) {
            //        gdi.TransparentText();
            //        gdi.TextColor(Cgdi.grey);

            //set appropriate team color
            if (this.Team().isBlue()) {
                //gdi.BluePen();
                ctx.fillStyle = "rgb(0, 0, 255)";
            } else {
                //gdi.RedPen();
                ctx.fillStyle = "rgb(255, 0, 0)";
            }

            //        //render the player's body
            //        m_vecPlayerVBTrans = WorldTransform(m_vecPlayerVB,
            //                Pos(),
            //                Heading(),
            //                Side(),
            //                Scale());
            //        gdi.ClosedShape(m_vecPlayerVBTrans);

            //        //and 'is 'ead
            //        gdi.BrownBrush();
            //        if (Prm.bHighlightIfThreatened && (Team().ControllingPlayer() == this) && isThreatened()) {
            //            gdi.YellowBrush();
            //        }
            ctx.beginPath();
            //ctx.fillStyle = 'rgb(0, 0, 0)'; // black
            ctx.arc(this.Pos().x, this.Pos().y, 6, 0, Math.PI * 2, false);
            ctx.fill();


            //        //render the state
            //        if (Prm.bStates) {
            //            gdi.TextColor(0, 170, 0);
            //            gdi.TextAtPos(m_vPosition.x, m_vPosition.y - 25,
            //                    new String(m_pStateMachine.GetNameOfCurrentState()));
            ctx.strokeText(this.m_pStateMachine.GetNameOfCurrentState(), this.position.x, this.position.y);
            //        }

            //        //show IDs
            //        if (Prm.bIDs) {
            //            gdi.TextColor(0, 170, 0);
            //            gdi.TextAtPos(Pos().x - 20, Pos().y - 25, ttos(ID()));
            //        }


            //        if (Prm.bViewTargets) {
            //            gdi.RedBrush();
            //            gdi.Circle(Steering().Target(), 3);
            //            gdi.TextAtPos(Steering().Target(), ttos(ID()));
            //        }
        }

        /**
         * routes any messages appropriately
         */
        //@Override
        public HandleMessage(msg: Telegram) {
            return this.m_pStateMachine.HandleMessage(msg);
        }

        //public GetFSM() {
        //    return this.m_pStateMachine;
        //}

        public ChangeState(state: State<FieldPlayer>) {
            this.m_pStateMachine.ChangeState(state);
        }

        public isInState(state: State<FieldPlayer>) {
            return this.m_pStateMachine.isInState(state);
        }

        public isReadyForNextKick() {
            return this.m_pKickLimiter.isReady();
        }
    }
}
