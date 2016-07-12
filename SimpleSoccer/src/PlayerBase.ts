/**
 *  Desc: Definition of a soccer player base class. <del>The player inherits
 *        from the autolist class so that any player created will be 
 *        automatically added to a list that is easily accesible by any
 *        other game objects.</del> (mainly used by the steering behaviors and
 *        player state classes)
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer;

//import java.util.ListIterator;
//import common.D2.Vector2D;
//import common.misc.AutoList;
//import java.util.LinkedList;
//import java.util.List;
//import static SimpleSoccer.ParamLoader.Prm;
//import static SimpleSoccer.MessageTypes.*;
//import static common.D2.Vector2D.*;
//import common.Game.Region;
//import static common.Messaging.MessageDispatcher.*;
//import static common.misc.utils.*;
//import static java.lang.Math.abs;

///<reference path='MovingEntity.ts' />

namespace SimpleSoccer {
    export enum player_role {
        goal_keeper, attacker, defender
    }

    export abstract class PlayerBase extends MovingEntity {
        private static m_Members: PlayerBase[] = [];


        //this player's role in the team
        protected m_PlayerRole: player_role;
        //a pointer to this player's team
        protected m_pTeam: SoccerTeam;
        //the steering behaviors
        protected m_pSteering: SteeringBehaviors;
        //the region that this player is assigned to.
        protected m_iHomeRegion: number;
        //the region this player moves to before kickoff
        protected m_iDefaultRegion: number;
        //the distance to the ball (in squared-space). This value is queried 
        //a lot so it's calculated once each time-step and stored here.
        protected m_dDistSqToBall: number;

        //the vertex buffer
        protected m_vecPlayerVB = <Vector2D[]>[]; // new LinkedList<Vector2D>();
        //the buffer for the transformed vertices
        protected m_vecPlayerVBTrans = <Vector2D[]>[]; // new LinkedList<Vector2D>();

        //----------------------------- ctor -------------------------------------
        //------------------------------------------------------------------------
        constructor(home_team: SoccerTeam,
            home_region: number,
            heading: Vector2D,
            velocity: Vector2D,
            mass: number,
            max_force: number,
            max_speed: number,
            max_turn_rate: number,
            scale: number,
            role: player_role) {

            super(home_team.Pitch().GetRegionFromIndex(home_region).Center(),
                scale * 10.0,
                velocity,
                max_speed,
                heading,
                mass,
                new Vector2D(scale, scale),
                max_turn_rate,
                max_force);
            this.m_pTeam = home_team;
            this.m_dDistSqToBall = MaxFloat;
            this.m_iHomeRegion = home_region;
            this.m_iDefaultRegion = home_region;
            this.m_PlayerRole = role;

            //setup the vertex buffers and calculate the bounding radius
            let player = [
                new Vector2D(-3, 8),
                new Vector2D(3, 10),
                new Vector2D(3, -10),
                new Vector2D(-3, -8)
            ];
            let NumPlayerVerts = player.length;

            for (let vtx = 0; vtx < NumPlayerVerts; ++vtx) {
                this.m_vecPlayerVB.push(player[vtx]);

                //set the bounding radius to the length of the 
                //greatest extent
                if (Math.abs(player[vtx].x) > this.m_dBoundingRadius) {
                    this.m_dBoundingRadius = Math.abs(player[vtx].x);
                }

                if (Math.abs(player[vtx].y) > this.m_dBoundingRadius) {
                    this.m_dBoundingRadius = Math.abs(player[vtx].y);
                }
            }

            //set up the steering behavior class
            this.m_pSteering = new SteeringBehaviors(this, this.m_pTeam.Pitch(), this.Ball());

            //a player's start target is its start position (because it's just waiting)
            this.m_pSteering.SetTarget(home_team.Pitch().GetRegionFromIndex(home_region).Center());
            //new AutoList<PlayerBase>().add(this);
            PlayerBase.m_Members.push(this);
        }

        public static GetAllMembers() {
            return this.m_Members;
        }

        //    @Override
        //    protected void finalize() throws Throwable {
        //        super.finalize();
        //        m_pSteering = null;
        //        new AutoList<PlayerBase>().remove(this);
        //    }

        /**
         *  returns true if there is an opponent within this player's 
         *  comfort zone
         */
        public isThreatened() {
            //check against all opponents to make sure non are within this
            //player's comfort zone
            //ListIterator<PlayerBase> it;
            //it = Team().Opponents().Members().listIterator();

            //while (it.hasNext()) {
            for (let it of this.Team().Opponents().Members()) {
                //PlayerBase curOpp = it.next();
                //calculate distance to the player. if dist is less than our
                //comfort zone, and the opponent is infront of the player, return true
                if (this.PositionInFrontOfPlayer(it.Pos()) && (Vec2DDistanceSq(this.Pos(), it.Pos()) < ParamLoader.PlayerComfortZoneSq)) {
                    return true;
                }

            }// next opp

            return false;
        }

        /**
         *  rotates the player to face the ball
         */
        public TrackBall() {
            this.RotateHeadingToFacePosition(this.Ball().Pos());
        }

        //    /**
        //     * sets the player's heading to point at the current target
        //     */
        //    public void TrackTarget() {
        //        SetHeading(Vec2DNormalize(sub(Steering().Target(), Pos())));
        //    }

        /**
         * determines the player who is closest to the SupportSpot and messages him
         * to tell him to change state to SupportAttacker
         */
        public FindSupport() {
            //if there is no support we need to find a suitable player.
            if (this.Team().SupportingPlayer() == null) {
                let BestSupportPly = this.Team().DetermineBestSupportingAttacker();
                this.Team().SetSupportingPlayer(BestSupportPly);
                let supportingPlayer = this.Team().SupportingPlayer();
                let message = MessageTypes.Msg_SupportAttacker;
                MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY, this.ID(), supportingPlayer.ID(), message, null);
            }

            let BestSupportPly = this.Team().DetermineBestSupportingAttacker();

            //if the best player available to support the attacker changes, update
            //the pointers and send messages to the relevant players to update their
            //states
            if (BestSupportPly !== null && (BestSupportPly !== this.Team().SupportingPlayer())) {

                if (this.Team().SupportingPlayer() !== null) {
                    let supportingPlayer = this.Team().SupportingPlayer();
                    let message = MessageTypes.Msg_GoHome;
                    MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY, this.ID(), supportingPlayer.ID(), message, null);
                }

                this.Team().SetSupportingPlayer(BestSupportPly);

                let supportingPlayer = this.Team().SupportingPlayer();
                let message = MessageTypes.Msg_SupportAttacker;
                MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY, this.ID(), supportingPlayer.ID(), message, null);
            }
        }

        /** 
         * @return true if the ball can be grabbed by the goalkeeper 
         */
        public BallWithinKeeperRange() {
            return Vec2DDistanceSq(this.Pos(), this.Ball().Pos()) < ParamLoader.KeeperInBallRangeSq;
        }

        /**
         * @return true if the ball is within kicking range
         */
        public BallWithinKickingRange() {
            return (Vec2DDistanceSq(this.Ball().Pos(), this.Pos()) < ParamLoader.PlayerKickingDistanceSq);
        }

        /** 
         * @return true if a ball comes within range of a receiver
         */
        public BallWithinReceivingRange() {
            return (Vec2DDistanceSq(this.Pos(), this.Ball().Pos()) < ParamLoader.BallWithinReceivingRangeSq);
        }

        /**
         * @return true if the player is located within the boundaries 
         *        of his home region
         */
        public InHomeRegion() {
            if (this.m_PlayerRole === player_role.goal_keeper) {
                return this.Pitch().GetRegionFromIndex(this.m_iHomeRegion).Inside(this.Pos(), Region.normal);
            } else {
                return this.Pitch().GetRegionFromIndex(this.m_iHomeRegion).Inside(this.Pos(), Region.halfsize);
            }
        }

        /**
         * 
         * @return true if this player is ahead of the attacker
         */
        public isAheadOfAttacker() {
            let opponentsGoal = this.Team().OpponentsGoal();
            let controllingPlayer = this.Team().ControllingPlayer();
            return Math.abs(this.Pos().x - opponentsGoal.Center().x) < Math.abs(controllingPlayer.Pos().x - opponentsGoal.Center().x);
        }

        //returns true if a player is located at the designated support spot
        //bool        AtSupportSpot()const;
        /**
         * @return true if the player is located at his steering target
         */
        public AtTarget() {
            return (Vec2DDistanceSq(this.Pos(), this.Steering().Target()) < ParamLoader.PlayerInTargetRangeSq);
        }

        /**
         * @return true if the player is the closest player in his team to the ball
         */
        public isClosestTeamMemberToBall() {
            return this.Team().PlayerClosestToBall() === this;
        }

        /**
         * @param position
         * @return true if the point specified by 'position' is located in
         * front of the player
         */
        public PositionInFrontOfPlayer(position: Vector2D) {
            let ToSubject = sub(position, this.Pos());

            if (ToSubject.Dot(this.Heading()) > 0) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * @return true if the player is the closest player on the pitch to the ball
         */
        public isClosestPlayerOnPitchToBall() {
            return this.isClosestTeamMemberToBall() && (this.DistSqToBall() < this.Team().Opponents().ClosestDistToBallSq());
        }

        /** 
         * @return true if this player is the controlling player
         */
        public isControllingPlayer() {
            return this.Team().ControllingPlayer() === this;
        }

        /** 
         * @return true if the player is located in the designated 'hot region' --
         * the area close to the opponent's goal 
         */
        public InHotRegion() {
            return Math.abs(this.Pos().x - this.Team().OpponentsGoal().Center().x) < this.Pitch().PlayingArea().Length() / 3.0;
        }

        public Role() {
            return this.m_PlayerRole;
        }

        public DistSqToBall() {
            return this.m_dDistSqToBall;
        }

        public SetDistSqToBall(val: number) {
            this.m_dDistSqToBall = val;
        }

        //    /**
        //     *  Calculate distance to opponent's/home goal. Used frequently by the passing methods
        //     */
        //    public double DistToOppGoal() {
        //        return abs(Pos().x - Team().OpponentsGoal().Center().x);
        //    }

        //    public double DistToHomeGoal() {
        //        return abs(Pos().x - Team().HomeGoal().Center().x);
        //    }

        public SetDefaultHomeRegion() {
            this.m_iHomeRegion = this.m_iDefaultRegion;
        }

        public Ball() {
            return this.Team().Pitch().Ball();
        }

        public Pitch() {
            return this.Team().Pitch();
        }

        public Steering() {
            return this.m_pSteering;
        }

        public HomeRegion() {
            return this.Pitch().GetRegionFromIndex(this.m_iHomeRegion);
        }

        public SetHomeRegion(NewRegion: number) {
            this.m_iHomeRegion = NewRegion;
        }

        public Team() {
            return this.m_pTeam;
        }

        //    /**
        //     * binary predicates for std::sort (see CanPassForward/Backward)
        //     */
        //    static public boolean SortByDistanceToOpponentsGoal(PlayerBase p1,
        //            PlayerBase p2) {
        //        return (p1.DistToOppGoal() < p2.DistToOppGoal());
        //    }

        //    static public boolean SortByReversedDistanceToOpponentsGoal(PlayerBase p1,
        //            PlayerBase p2) {
        //        return (p1.DistToOppGoal() > p2.DistToOppGoal());
        //    }


    }
}
