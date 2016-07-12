///**
// *  Desc:   class to define a team of soccer playing agents. A SoccerTeam
// *          contains several field players and one goalkeeper. A SoccerTeam
// *          is implemented as a finite state machine and has states for
// *          attacking, defending, and KickOff.
// * 
// * @author Petr (http://www.sallyx.org/)
// */
//package SimpleSoccer;

//import SimpleSoccer.FieldPlayerStates.ReturnToHomeRegion;
//import SimpleSoccer.FieldPlayerStates.Wait;
//import SimpleSoccer.TeamStates.PrepareForKickOff;
//import SimpleSoccer.TeamStates.Attacking;
//import SimpleSoccer.TeamStates.Defending;
//import SimpleSoccer.GoalKeeperStates.TendGoal;
//import static common.Debug.DbgConsole.*;
//import common.D2.Vector2D;
//import static common.D2.Vector2D.*;
//import static common.D2.Transformation.*;
//import static common.D2.geometry.*;
//import common.FSM.StateMachine;
//import static common.Game.EntityManager.EntityMgr;
//import static common.Messaging.MessageDispatcher.*;
//import common.misc.Cgdi;
//import static common.misc.Cgdi.gdi;
//import static common.misc.CppToJava.ObjectRef;
//import static common.misc.utils.*;
//import static common.misc.Stream_Utility_function.ttos;
//import static java.lang.Math.abs;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.ListIterator;
//import static SimpleSoccer.DEFINE.*;
//import static SimpleSoccer.ParamLoader.Prm;
//import static SimpleSoccer.MessageTypes.*;

namespace SimpleSoccer {
    export enum team_color {
        blue, red
    }

    export class SoccerTeam {


        public static blue = team_color.blue;
        public static red = team_color.red;
        //an instance of the state machine class
        private m_pStateMachine: StateMachine<SoccerTeam>;
        //the team must know its own color!
        private m_Color: team_color;
        //pointers to the team members
        private m_Players = <PlayerBase[]>[]; // new Array<PlayerBase>(5);
        //a pointer to the soccer pitch
        private m_pPitch: SoccerPitch;
        //pointers to the goals
        private m_pOpponentsGoal: Goal;
        private m_pHomeGoal: Goal;
        //a pointer to the opposing team
        private m_pOpponents: SoccerTeam;
        //pointers to 'key' players
        private m_pControllingPlayer: PlayerBase;
        private m_pSupportingPlayer: PlayerBase;
        private m_pReceivingPlayer: PlayerBase;
        private m_pPlayerClosestToBall: PlayerBase;
        //the squared distance the closest player is from the ball
        private m_dDistSqToBallOfClosestPlayer: number;
        //players use this to determine strategic positions on the playing field
        private m_pSupportSpotCalc: SupportSpotCalculator;



        //----------------------------- ctor -------------------------------------
        //
        //------------------------------------------------------------------------
        constructor(home_goal: Goal, opponents_goal: Goal, pitch: SoccerPitch, color: team_color) {
            this.m_pOpponentsGoal = opponents_goal;
            this.m_pHomeGoal = home_goal;
            this.m_pOpponents = null;
            this.m_pPitch = pitch;
            this.m_Color = color;
            this.m_dDistSqToBallOfClosestPlayer = 0.0;
            this.m_pSupportingPlayer = null;
            this.m_pReceivingPlayer = null;
            this.m_pControllingPlayer = null;
            this.m_pPlayerClosestToBall = null;

            //setup the state machine
            this.m_pStateMachine = new StateMachine<SoccerTeam>(this);

            this.m_pStateMachine.SetCurrentState(Defending.Instance());
            this.m_pStateMachine.SetPreviousState(Defending.Instance());
            this.m_pStateMachine.SetGlobalState(null);

            //create the players and goalkeeper
            this.CreatePlayers();

            //set default steering behaviors
            //ListIterator < PlayerBase > it = m_Players.listIterator();
            //while (it.hasNext()) {
            for (let it of this.m_Players) {
                it.Steering().SeparationOn();
            }

            //create the sweet spot calculator
            this.m_pSupportSpotCalc = new SupportSpotCalculator(ParamLoader.NumSupportSpotsX, ParamLoader.NumSupportSpotsY, this);
        }

        //    //----------------------- dtor -------------------------------------------
        ////
        ////------------------------------------------------------------------------
        //    @Override
        //    protected void finalize() throws Throwable {
        //        super.finalize();
        //        m_pStateMachine = null;

        //        m_Players.clear();

        //        m_pSupportSpotCalc = null;
        //    }

        /**
         *  renders the players and any team related info
         */
        public Render(ctx: CanvasRenderingContext2D) {
            //ListIterator < PlayerBase > it = m_Players.listIterator();
            //while (it.hasNext()) {
            for (let it of this.m_Players) {
                it.Render(ctx);
            }

            //show the controlling team and player at the top of the display
            //if (Prm.bShowControllingTeam) {
            //    gdi.TextColor(Cgdi.white);

            if (this.Color() === team_color.blue && this.InControl()) {
                ctx.strokeStyle = "blue";
                ctx.strokeText("Blue in Control", 20, 3);
            } else if (this.Color() === team_color.red && this.InControl()) {
                ctx.strokeStyle = "red";
                ctx.strokeText("Red in Control", 20, 3);

            }
            //    if (m_pControllingPlayer != null) {
            //        gdi.TextAtPos(Pitch().cxClient() - 150, 3,
            //            "Controlling Player: " + ttos(m_pControllingPlayer.ID()));
            //    }
            //}

            ////render the sweet spots
            //if (Prm.bSupportSpots && InControl()) {
            //    m_pSupportSpotCalc.Render();
            //}

            ////define(SHOW_TEAM_STATE);
            //if (def(SHOW_TEAM_STATE)) {
            //    if (Color() == red) {
            //        gdi.TextColor(Cgdi.white);

            //        if (m_pStateMachine.CurrentState() == Attacking.Instance()) {
            //            gdi.TextAtPos(160, 20, "Attacking");
            //        }
            //        if (m_pStateMachine.CurrentState() == Defending.Instance()) {
            //            gdi.TextAtPos(160, 20, "Defending");
            //        }
            //        if (m_pStateMachine.CurrentState() == PrepareForKickOff.Instance()) {
            //            gdi.TextAtPos(160, 20, "Kickoff");
            //        }
            //    } else {
            //        if (m_pStateMachine.CurrentState() == Attacking.Instance()) {
            //            gdi.TextAtPos(160, Pitch().cyClient() - 40, "Attacking");
            //        }
            //        if (m_pStateMachine.CurrentState() == Defending.Instance()) {
            //            gdi.TextAtPos(160, Pitch().cyClient() - 40, "Defending");
            //        }
            //        if (m_pStateMachine.CurrentState() == PrepareForKickOff.Instance()) {
            //            gdi.TextAtPos(160, Pitch().cyClient() - 40, "Kickoff");
            //        }
            //    }
            //}

            //// define(SHOW_SUPPORTING_PLAYERS_TARGET)
            //if (def(SHOW_SUPPORTING_PLAYERS_TARGET)) {
            //    if (m_pSupportingPlayer != null) {
            //        gdi.BlueBrush();
            //        gdi.RedPen();
            //        gdi.Circle(m_pSupportingPlayer.Steering().Target(), 4);
            //    }
            //}
        }

        /**
         *  iterates through each player's update function and calculates 
         *  frequently accessed info
         */
        public Update() {
            //this information is used frequently so it's more efficient to 
            //calculate it just once each frame
            this.CalculateClosestPlayerToBall();

            //the team state machine switches between attack/defense behavior. It
            //also handles the 'kick off' state where a team must return to their
            //kick off positions before the whistle is blown
            this.m_pStateMachine.Update();

            //now update each player
            //ListIterator<PlayerBase> it = m_Players.listIterator();
            //while (it.hasNext()) {
            for (let it of this.m_Players) {
                it.Update();
            }

        }

        /**
         * calling this changes the state of all field players to that of 
         * ReturnToHomeRegion. Mainly used when a goal keeper has
         * possession
         */
        public ReturnAllFieldPlayersToHome() {
            //ListIterator<PlayerBase> it = m_Players.listIterator();
            //while (it.hasNext()) {
            for (let it of this.m_Players) {
                //PlayerBase cur = it.next();
                if (it.Role() !== player_role.goal_keeper) {
                    MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY, 1, it.ID(), MessageTypes.Msg_GoHome, null);
                }
            }
        }

        /**
         *  Given a ball position, a kicking power and a reference to a vector2D
         *  this function will sample random positions along the opponent's goal-
         *  mouth and check to see if a goal can be scored if the ball was to be
         *  kicked in that direction with the given power. If a possible shot is 
         *  found, the function will immediately return true, with the target 
         *  position stored in the vector ShotTarget.

         * returns true if player has a clean shot at the goal and sets ShotTarget
         * to a normalized vector pointing in the direction the shot should be
         * made. Else returns false and sets heading to a zero vector
         */
        //    public boolean CanShoot(Vector2D BallPos, double power) {
        //        return CanShoot(BallPos, power, new Vector2D());
        //    }
        public CanShoot(BallPos: Vector2D, power: number) {
            let ShotTarget = new Vector2D();
            //the number of randomly created shot targets this method will test 
            let NumAttempts = ParamLoader.NumAttemptsToFindValidStrike;
            while (NumAttempts-- > 0) {
                //choose a random position along the opponent's goal mouth. (making
                //sure the ball's radius is taken into account)

                ShotTarget.set(this.OpponentsGoal().Center());

                //the y value of the shot position should lay somewhere between two
                //goalposts (taking into consideration the ball diameter)
                let MinYVal = /*(int)*/Math.floor(this.OpponentsGoal().LeftPost().y + this.Pitch().Ball().BRadius());
                let MaxYVal = /*(int)*/Math.floor(this.OpponentsGoal().RightPost().y - this.Pitch().Ball().BRadius());

                ShotTarget.y = RandInt(MinYVal, MaxYVal);

                //make sure striking the ball with the given power is enough to drive
                //the ball over the goal line.
                let time = this.Pitch().Ball().TimeToCoverDistance(BallPos, ShotTarget, power);

                //if it is, this shot is then tested to see if any of the opponents
                //can intercept it.
                if (time >= 0) {
                    if (this.isPassSafeFromAllOpponents(BallPos, ShotTarget, null, power)) {
                        return ShotTarget;
                    }
                }
            }

            return null;
        }

        /**
         * The best pass is considered to be the pass that cannot be intercepted 
         * by an opponent and that is as far forward of the receiver as possible  
         * If a pass is found, the receiver's address is returned in the 
         * reference, 'receiver' and the position the pass will be made to is 
         * returned in the  reference 'PassTarget'
         */
        public FindPass(passer: PlayerBase, power: number, MinPassingDistance: number) {
            //assert(receiver != null);
            //assert(PassTarget != null);
            //ListIterator < PlayerBase > it = Members().listIterator();

            let ClosestToGoalSoFar = MaxFloat;
            //let receiver = <PlayerBase>null;
            let finded = false;
            let result = {
                receiver: <PlayerBase>null,
                PassTarget: <Vector2D>null
            };
            //iterate through all this player's team members and calculate which
            //one is in a position to be passed the ball 
            //while (it.hasNext()) {
            for (let it of this.Members()) {
                //PlayerBase curPlyr = it.next();
                //make sure the potential receiver being examined is not this player
                //and that it is further away than the minimum pass distance
                if ((it !== passer) && (Vec2DDistanceSq(passer.Pos(), it.Pos()) > MinPassingDistance * MinPassingDistance)) {
                    let Target = this.GetBestPassToReceiver(passer, it, power);
                    if (/*this.GetBestPassToReceiver(passer, it, power)*/Target) {
                        //if the pass target is the closest to the opponent's goal line found
                        // so far, keep a record of it
                        let Dist2Goal = Math.abs(Target.x - this.OpponentsGoal().Center().x);

                        if (Dist2Goal < ClosestToGoalSoFar) {
                            ClosestToGoalSoFar = Dist2Goal;

                            //keep a record of this player
                            result.receiver = it;

                            //and the target
                            result.PassTarget = new Vector2D(Target.x, Target.y);

                            finded = true;
                        }
                    }
                }
            }//next team member

            //return finded;
            return result;
        }

        /**
         *  Three potential passes are calculated. One directly toward the receiver's
         *  current position and two that are the tangents from the ball position
         *  to the circle of radius 'range' from the receiver.
         *  These passes are then tested to see if they can be intercepted by an
         *  opponent and to make sure they terminate within the playing area. If
         *  all the passes are invalidated the function returns false. Otherwise
         *  the function returns the pass that takes the ball closest to the 
         *  opponent's goal area.
         */
        public GetBestPassToReceiver(passer: PlayerBase, receiver: PlayerBase, power: number) {
            //assert(PassTarget != null);
            let PassTarget: Vector2D;
            //first, calculate how much time it will take for the ball to reach 
            //this receiver, if the receiver was to remain motionless 
            let time = this.Pitch().Ball().TimeToCoverDistance(this.Pitch().Ball().Pos(), receiver.Pos(), power);

            //return false if ball cannot reach the receiver after having been
            //kicked with the given power
            if (time < 0) {
                return null;
            }

            //the maximum distance the receiver can cover in this time
            let InterceptRange = time * receiver.MaxSpeed();

            //Scale the intercept range
            const ScalingFactor = 0.3;
            InterceptRange *= ScalingFactor;

            //now calculate the pass targets which are positioned at the intercepts
            //of the tangents from the ball to the receiver's range circle.
            let ip1 = new Vector2D();
            let ip2 = new Vector2D();

            GetTangentPoints(receiver.Pos(), InterceptRange, this.Pitch().Ball().Pos(), ip1, ip2);

            let Passes = [ip1, receiver.Pos(), ip2];
            const NumPassesToTry = Passes.length;

            // this pass is the best found so far if it is:
            //
            //  1. Further upfield than the closest valid pass for this receiver
            //     found so far
            //  2. Within the playing area
            //  3. Cannot be intercepted by any opponents

            let ClosestSoFar = MaxFloat;
            let bResult = false;

            for (let pass = 0; pass < NumPassesToTry; ++pass) {
                let dist = Math.abs(Passes[pass].x - this.OpponentsGoal().Center().x);

                if ((dist < ClosestSoFar)
                    && this.Pitch().PlayingArea().Inside(Passes[pass])
                    && this.isPassSafeFromAllOpponents(this.Pitch().Ball().Pos(), Passes[pass], receiver, power)) {
                    ClosestSoFar = dist;
                    PassTarget = new Vector2D(Passes[pass].x, Passes[pass].y);
                    bResult = true;
                }
            }

            //return bResult;
            return PassTarget;
        }

        /**
         * test if a pass from positions 'from' to 'target' kicked with force 
         * 'PassingForce'can be intercepted by an opposing player
         */
        public isPassSafeFromOpponent(from: Vector2D, target: Vector2D, receiver: PlayerBase, opp: PlayerBase, PassingForce: number) {
            //move the opponent into local space.
            let ToTarget = sub(target, from);
            let ToTargetNormalized = Vec2DNormalize(ToTarget);

            let LocalPosOpp = PointToLocalSpace(opp.Pos(), ToTargetNormalized, ToTargetNormalized.Perp(), from);

            //if opponent is behind the kicker then pass is considered okay(this is 
            //based on the assumption that the ball is going to be kicked with a 
            //velocity greater than the opponent's max velocity)
            if (LocalPosOpp.x < 0) {
                return true;
            }

            //if the opponent is further away than the target we need to consider if
            //the opponent can reach the position before the receiver.
            if (Vec2DDistanceSq(from, target) < Vec2DDistanceSq(opp.Pos(), from)) {
                if (receiver != null) {
                    if (Vec2DDistanceSq(target, opp.Pos()) > Vec2DDistanceSq(target, receiver.Pos())) {
                        return true;
                    } else {
                        return false;
                    }

                } else {
                    return true;
                }
            }

            //calculate how long it takes the ball to cover the distance to the 
            //position orthogonal to the opponents position
            let TimeForBall = this.Pitch().Ball().TimeToCoverDistance(new Vector2D(0, 0), new Vector2D(LocalPosOpp.x, 0), PassingForce);

            //now calculate how far the opponent can run in this time
            let reach = opp.MaxSpeed() * TimeForBall + this.Pitch().Ball().BRadius() + opp.BRadius();

            //if the distance to the opponent's y position is less than his running
            //range plus the radius of the ball and the opponents radius then the
            //ball can be intercepted
            if (Math.abs(LocalPosOpp.y) < reach) {
                return false;
            }

            return true;
        }

        /**
         * tests a pass from position 'from' to position 'target' against each member
         * of the opposing team. Returns true if the pass can be made without
         * getting intercepted
         */
        public isPassSafeFromAllOpponents(from: Vector2D, target: Vector2D, receiver: PlayerBase, PassingForce: number) {
            //ListIterator<PlayerBase> opp = Opponents().Members().listIterator();
            //while (opp.hasNext()) {
            for (let opp of this.Opponents().Members()) {
                if (!this.isPassSafeFromOpponent(from, target, receiver, opp, PassingForce)) {
                    //debug_on();

                    return false;
                }
            }

            return true;
        }

        /**
         * returns true if an opposing player is within the radius of the position
         * given as a par ameter
         */
        public isOpponentWithinRadius(pos: Vector2D, rad: number) {
            //ListIterator<PlayerBase> it = Opponents().Members().listIterator();
            //while (it.hasNext()) {
            for (let it of this.Opponents().Members()) {
                if (Vec2DDistanceSq(pos, it.Pos()) < rad * rad) {
                    return true;
                }
            }

            return false;
        }

        /**
         * this tests to see if a pass is possible between the requester and
         * the controlling player. If it is possible a message is sent to the
         * controlling player to pass the ball asap.
         */
        public RequestPass(requester: FieldPlayer) {
            //maybe put a restriction here
            if (RandFloat() > 0.1) {
                return;
            }

            if (this.isPassSafeFromAllOpponents(this.ControllingPlayer().Pos(), requester.Pos(), requester, ParamLoader.MaxPassingForce)) {

                //tell the player to make the pass
                //let the receiver know a pass is coming 
                let controllingPlayer = this.ControllingPlayer();
                let message = MessageTypes.Msg_PassToMe;
                MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY, requester.ID(), controllingPlayer.ID(), message, requester);

            }
        }

        /**
         * calculate the closest player to the SupportSpot
         */
        public DetermineBestSupportingAttacker() {
            let ClosestSoFar = MaxFloat;

            let BestPlayer: PlayerBase = null;

            //ListIterator < PlayerBase > it = m_Players.listIterator();
            //while (it.hasNext()) {
            for (let it of this.m_Players) {
                //PlayerBase cur = it.next();
                //only attackers utilize the BestSupportingSpot
                if ((it.Role() === player_role.attacker) && (it !== this.m_pControllingPlayer)) {
                    //calculate the dist. Use the squared value to avoid sqrt
                    let dist = Vec2DDistanceSq(it.Pos(), this.m_pSupportSpotCalc.GetBestSupportingSpot());

                    //if the distance is the closest so far and the player is not a
                    //goalkeeper and the player is not the one currently controlling
                    //the ball, keep a record of this player
                    if ((dist < ClosestSoFar)) {
                        ClosestSoFar = dist;
                        BestPlayer = it;
                    }
                }
            }

            return BestPlayer;
        }

        public Members() {
            return this.m_Players;
        }

        public GetFSM() {
            return this.m_pStateMachine;
        }

        public HomeGoal() {
            return this.m_pHomeGoal;
        }

        public OpponentsGoal() {
            return this.m_pOpponentsGoal;
        }

        public Pitch() {
            return this.m_pPitch;
        }

        public Opponents() {
            return this.m_pOpponents;
        }

        public SetOpponents(opps: SoccerTeam) {
            this.m_pOpponents = opps;
        }

        public Color() {
            return this.m_Color;
        }

        public SetPlayerClosestToBall(plyr: PlayerBase) {
            this.m_pPlayerClosestToBall = plyr;
        }

        public PlayerClosestToBall() {
            return this.m_pPlayerClosestToBall;
        }

        public ClosestDistToBallSq() {
            return this.m_dDistSqToBallOfClosestPlayer;
        }

        public GetSupportSpot() {
            let v = this.m_pSupportSpotCalc.GetBestSupportingSpot();
            return new Vector2D(v.x, v.y);
        }

        public SupportingPlayer() {
            return this.m_pSupportingPlayer;
        }

        public SetSupportingPlayer(plyr: PlayerBase) {
            this.m_pSupportingPlayer = plyr;
        }

        public Receiver() {
            return this.m_pReceivingPlayer;
        }

        public SetReceiver(plyr: PlayerBase) {
            this.m_pReceivingPlayer = plyr;
        }

        public ControllingPlayer() {
            return this.m_pControllingPlayer;
        }

        public SetControllingPlayer(plyr: PlayerBase) {
            this.m_pControllingPlayer = plyr;

            //rub it in the opponents faces!
            this.Opponents().LostControl();
        }

        public InControl() {
            if (this.m_pControllingPlayer != null) {
                return true;
            } else {
                return false;
            }
        }

        public LostControl() {
            this.m_pControllingPlayer = null;
        }

        //    public PlayerBase GetPlayerFromID(int id) {
        //        ListIterator<PlayerBase> it = m_Players.listIterator();

        //        while (it.hasNext()) {
        //            PlayerBase cur = it.next();
        //            if (cur.ID() == id) {
        //                return cur;
        //            }
        //        }

        //        return null;
        //    }

        public SetPlayerHomeRegion(plyr: number, region: number) {
            //assert ((plyr >= 0) && (plyr < (int) m_Players.size()));

            this.m_Players[plyr].SetHomeRegion(region);
        }

        public DetermineBestSupportingPosition() {
            this.m_pSupportSpotCalc.DetermineBestSupportingPosition();
        }

        //---------------------- UpdateTargetsOfWaitingPlayers ------------------------
        //
        //  
        public UpdateTargetsOfWaitingPlayers() {
            //ListIterator<PlayerBase> it = m_Players.listIterator();
            //while (it.hasNext()) {
            for (let it of this.m_Players) {
                //PlayerBase cur = it.next();
                if (it.Role() !== player_role.goal_keeper) {
                    //cast to a field player
                    let plyr = <FieldPlayer>it;

                    if (plyr.isInState(Wait.Instance()) || plyr.isInState(ReturnToHomeRegion.Instance())) {
                        plyr.Steering().SetTarget(plyr.HomeRegion().Center());
                    }
                }
            }
        }

        /**
         * @return false if any of the team are not located within their home region
         */
        public AllPlayersAtHome() {
            //ListIterator<PlayerBase> it = m_Players.listIterator();
            //while (it.hasNext()) {
            for (let it of this.m_Players) {
                if (it.InHomeRegion() === false) {
                    return false;
                }
            }

            return true;
        }

        /**
         * creates all the players for this team
         */
        private CreatePlayers() {
            let m_Players = this.m_Players;
            if (this.Color() === SoccerTeam.blue) {
                //goalkeeper
                m_Players.push(new GoalKeeper(this,
                    1,
                    TendGoal.Instance(),
                    new Vector2D(0, 1),
                    new Vector2D(0.0, 0.0),
                    ParamLoader.PlayerMass,
                    ParamLoader.PlayerMaxForce,
                    ParamLoader.PlayerMaxSpeedWithoutBall,
                    ParamLoader.PlayerMaxTurnRate,
                    ParamLoader.PlayerScale));

                //create the players
                m_Players.push(new FieldPlayer(this,
                    6,
                    Wait.Instance(),
                    new Vector2D(0, 1),
                    new Vector2D(0.0, 0.0),
                    ParamLoader.PlayerMass,
                    ParamLoader.PlayerMaxForce,
                    ParamLoader.PlayerMaxSpeedWithoutBall,
                    ParamLoader.PlayerMaxTurnRate,
                    ParamLoader.PlayerScale,
                    player_role.attacker));



                m_Players.push(new FieldPlayer(this,
                    8,
                    Wait.Instance(),
                    new Vector2D(0, 1),
                    new Vector2D(0.0, 0.0),
                    ParamLoader.PlayerMass,
                    ParamLoader.PlayerMaxForce,
                    ParamLoader.PlayerMaxSpeedWithoutBall,
                    ParamLoader.PlayerMaxTurnRate,
                    ParamLoader.PlayerScale,
                    player_role.attacker));


                m_Players.push(new FieldPlayer(this,
                    3,
                    Wait.Instance(),
                    new Vector2D(0, 1),
                    new Vector2D(0.0, 0.0),
                    ParamLoader.PlayerMass,
                    ParamLoader.PlayerMaxForce,
                    ParamLoader.PlayerMaxSpeedWithoutBall,
                    ParamLoader.PlayerMaxTurnRate,
                    ParamLoader.PlayerScale,
                    player_role.defender));


                m_Players.push(new FieldPlayer(this,
                    5,
                    Wait.Instance(),
                    new Vector2D(0, 1),
                    new Vector2D(0.0, 0.0),
                    ParamLoader.PlayerMass,
                    ParamLoader.PlayerMaxForce,
                    ParamLoader.PlayerMaxSpeedWithoutBall,
                    ParamLoader.PlayerMaxTurnRate,
                    ParamLoader.PlayerScale,
                    player_role.defender));

            } else {
                //goalkeeper
                m_Players.push(new GoalKeeper(this,
                    16,
                    TendGoal.Instance(),
                    new Vector2D(0, -1),
                    new Vector2D(0.0, 0.0),
                    ParamLoader.PlayerMass,
                    ParamLoader.PlayerMaxForce,
                    ParamLoader.PlayerMaxSpeedWithoutBall,
                    ParamLoader.PlayerMaxTurnRate,
                    ParamLoader.PlayerScale));


                //create the players
                m_Players.push(new FieldPlayer(this,
                    9,
                    Wait.Instance(),
                    new Vector2D(0, -1),
                    new Vector2D(0.0, 0.0),
                    ParamLoader.PlayerMass,
                    ParamLoader.PlayerMaxForce,
                    ParamLoader.PlayerMaxSpeedWithoutBall,
                    ParamLoader.PlayerMaxTurnRate,
                    ParamLoader.PlayerScale,
                    player_role.attacker));

                m_Players.push(new FieldPlayer(this,
                    11,
                    Wait.Instance(),
                    new Vector2D(0, -1),
                    new Vector2D(0.0, 0.0),
                    ParamLoader.PlayerMass,
                    ParamLoader.PlayerMaxForce,
                    ParamLoader.PlayerMaxSpeedWithoutBall,
                    ParamLoader.PlayerMaxTurnRate,
                    ParamLoader.PlayerScale,
                    player_role.attacker));


                m_Players.push(new FieldPlayer(this,
                    12,
                    Wait.Instance(),
                    new Vector2D(0, -1),
                    new Vector2D(0.0, 0.0),
                    ParamLoader.PlayerMass,
                    ParamLoader.PlayerMaxForce,
                    ParamLoader.PlayerMaxSpeedWithoutBall,
                    ParamLoader.PlayerMaxTurnRate,
                    ParamLoader.PlayerScale,
                    player_role.defender));


                m_Players.push(new FieldPlayer(this,
                    14,
                    Wait.Instance(),
                    new Vector2D(0, -1),
                    new Vector2D(0.0, 0.0),
                    ParamLoader.PlayerMass,
                    ParamLoader.PlayerMaxForce,
                    ParamLoader.PlayerMaxSpeedWithoutBall,
                    ParamLoader.PlayerMaxTurnRate,
                    ParamLoader.PlayerScale,
                    player_role.defender));

            }

            //register the players with the entity manager
            //ListIterator < PlayerBase > it = m_Players.listIterator();
            //while (it.hasNext()) {
            for (let it of this.m_Players) {
                EntityManager.EntityMgr.RegisterEntity(it);
            }
        }

        /**
         * called each frame. Sets m_pClosestPlayerToBall to point to the player
         * closest to the ball. 
         */
        private CalculateClosestPlayerToBall() {
            let ClosestSoFar = MaxFloat;

            //ListIterator < PlayerBase > it = m_Players.listIterator();
            //while (it.hasNext()) {
            for (let it of this.m_Players) {
                //PlayerBase cur = it.next();
                //calculate the dist. Use the squared value to avoid sqrt
                let dist = Vec2DDistanceSq(it.Pos(), this.Pitch().Ball().Pos());

                //keep a record of this value for each player
                it.SetDistSqToBall(dist);

                if (dist < ClosestSoFar) {
                    ClosestSoFar = dist;

                    this.m_pPlayerClosestToBall = it;
                }
            }

            this.m_dDistSqToBallOfClosestPlayer = ClosestSoFar;
        }

        //    /**
        //     * @return Name of the team ("Red" or "Blue")
        //     */
        //    public String Name() {
        //        if (m_Color == blue) {
        //            return "Blue";
        //        }
        //        return "Red";
        //    }
    }
}
