/**
 * 
 *  Desc:   class to encapsulate steering behaviors for a soccer player
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer;

//import java.util.ArrayList;
//import java.util.ListIterator;
//import common.misc.AutoList;
//import java.util.List;
//import common.D2.Vector2D;
//import java.lang.reflect.Array;
//import java.util.Arrays;
//import static common.D2.Vector2D.*;
//import static common.misc.Cgdi.gdi;
//import static SimpleSoccer.ParamLoader.Prm;
namespace SimpleSoccer {
    enum behavior_type {

        none = 0x0000,
        seek = 0x0001,
        arrive = 0x0002,
        separation = 0x0004,
        pursuit = 0x0008,
        interpose = 0x0010,
        //private static flag: number;

        //static behavior_type(flag: number) {
        //    this.flag = flag;
        //}

        //static flag() {
        //    return this.flag;
        //}
    }


    //Arrive makes use of these to determine how quickly a vehicle
    //should decelerate to its target
    enum Deceleration {
        slow = 3,
        normal = 2,
        fast = 1,
    }

    export class SteeringBehaviors {

        private m_pPlayer: PlayerBase;
        private m_pBall: SoccerBall;
        //the steering force created by the combined effect of all
        //the selected behaviors
        private m_vSteeringForce = new Vector2D();
        //the current target (usually the ball or predicted ball position)
        private m_vTarget = new Vector2D();
        //the distance the player tries to interpose from the target
        private m_dInterposeDist: number;
        //multipliers. 
        private m_dMultSeparation: number;
        //how far it can 'see'
        private m_dViewDistance: number;
        //binary flags to indicate whether or not a behavior should be active
        private m_iFlags: number;


        //used by group behaviors to tag neighbours
        private m_bTagged: boolean;

        //    //Arrive makes use of these to determine how quickly a vehicle
        //    //should decelerate to its target
        //    private enum Deceleration {

        //        slow(3), normal(2), fast(1);
        //        private int dec;

        //        Deceleration(int d) {
        //            this.dec = d;
        //        }

        //        public int value() {
        //            return dec;
        //        }
        //    }

        /**
         * Given a target, this behavior returns a steering force which will
         * allign the agent with the target and move the agent in the desired
         * direction
         */
        private Seek(target: Vector2D) {

            let DesiredVelocity = Vec2DNormalize(mul(this.m_pPlayer.MaxSpeed(), sub(target, this.m_pPlayer.Pos())));

            return sub(DesiredVelocity, this.m_pPlayer.Velocity());
        }

        /**
         * This behavior is similar to seek but it attempts to arrive at the
         *  target with a zero velocity
         */
        private Arrive(TargetPos: Vector2D, deceleration: Deceleration) {
            let ToTarget = sub(TargetPos, this.m_pPlayer.Pos());

            //calculate the distance to the target
            let dist = ToTarget.Length();

            if (dist > 0) {
                //because Deceleration is enumerated as an int, this value is required
                //to provide fine tweaking of the deceleration..
                const DecelerationTweaker = 0.3;

                //calculate the speed required to reach the target given the desired
                //deceleration
                let speed = dist / (deceleration * DecelerationTweaker);

                //make sure the velocity does not exceed the max
                speed = Math.min(speed, this.m_pPlayer.MaxSpeed());

                //from here proceed just like Seek except we don't need to normalize 
                //the ToTarget vector because we have already gone to the trouble
                //of calculating its length: dist. 
                let DesiredVelocity = mul(speed / dist, ToTarget);

                return sub(DesiredVelocity, this.m_pPlayer.Velocity());
            }

            return new Vector2D(0, 0);
        }

        /**
         * This behavior predicts where its prey will be and seeks
         * to that location
         * This behavior creates a force that steers the agent towards the 
         * ball
         */
        private Pursuit(ball: SoccerBall) {
            let ToBall = sub(ball.Pos(), this.m_pPlayer.Pos());

            //the lookahead time is proportional to the distance between the ball
            //and the pursuer; 
            let LookAheadTime = 0.0;

            if (ball.Speed() != 0.0) {
                LookAheadTime = ToBall.Length() / ball.Speed();
            }

            //calculate where the ball will be at this time in the future
            this.m_vTarget = ball.FuturePosition(LookAheadTime);

            //now seek to the predicted future position of the ball
            return this.Arrive(this.m_vTarget, Deceleration.fast);
        }

        /**
         *
         * this calculates a force repelling from the other neighbors
         */
        private Separation() {
            //iterate through all the neighbors and calculate the vector from them
            let SteeringForce = new Vector2D();

            //List < PlayerBase > AllPlayers = new AutoList<PlayerBase>().GetAllMembers();
            let AllPlayers = PlayerBase.GetAllMembers();
            //ListIterator < PlayerBase > it = AllPlayers.listIterator();
            //while (it.hasNext()) {
            for (let it of AllPlayers) {
                //PlayerBase curPlyr = it.next();
                //make sure this agent isn't included in the calculations and that
                //the agent is close enough
                if ((it !== this.m_pPlayer) && it.Steering().Tagged()) {
                    let ToAgent = sub(this.m_pPlayer.Pos(), it.Pos());

                    //scale the force inversely proportional to the agents distance  
                    //from its neighbor.
                    SteeringForce.add(div(Vec2DNormalize(ToAgent), ToAgent.Length()));
                }
            }

            return SteeringForce;
        }

        /**
         * Given an opponent and an object position this method returns a 
         * force that attempts to position the agent between them
         */
        private Interpose(ball: SoccerBall,
            target: Vector2D,
            DistFromTarget: number) {
            return this.Arrive(add(target, mul(DistFromTarget, Vec2DNormalize(sub(ball.Pos(), target)))), Deceleration.normal);
        }

        /**
         *  tags any vehicles within a predefined radius
         */
        private FindNeighbours() {
            //List < PlayerBase > AllPlayers = new AutoList<PlayerBase>().GetAllMembers();
            let AllPlayers = PlayerBase.GetAllMembers();
            //ListIterator < PlayerBase > it = AllPlayers.listIterator();
            //while (it.hasNext()) {
            for (let it of AllPlayers) {
                //PlayerBase curPlyr = it.next();

                //first clear any current tag
                it.Steering().UnTag();

                //work in distance squared to avoid sqrts
                let to = sub(it.Pos(), this.m_pPlayer.Pos());

                if (to.LengthSq() < (this.m_dViewDistance * this.m_dViewDistance)) {
                    it.Steering().Tag();
                }
            }//next
        }

        /**
         * this function tests if a specific bit of m_iFlags is set
         */
        private On(bt: behavior_type) {
            return (this.m_iFlags & bt) === bt;
        }

        /**
         *  This function calculates how much of its max steering force the 
         *  vehicle has left to apply and then applies that amount of the
         *  force to add.
         */
        private AccumulateForce(sf: Vector2D, ForceToAdd: Vector2D) {
            //first calculate how much steering force we have left to use
            let MagnitudeSoFar = sf.Length();

            let magnitudeRemaining = this.m_pPlayer.MaxForce() - MagnitudeSoFar;

            //return false if there is no more force left to use
            if (magnitudeRemaining <= 0.0) {
                return false;
            }

            //calculate the magnitude of the force we want to add
            let MagnitudeToAdd = ForceToAdd.Length();

            //now calculate how much of the force we can really add  
            if (MagnitudeToAdd > magnitudeRemaining) {
                MagnitudeToAdd = magnitudeRemaining;
            }

            //add it to the steering force
            sf.add(mul(MagnitudeToAdd, Vec2DNormalize(ForceToAdd)));

            return true;
        }

        /**
         * this method calls each active steering behavior and acumulates their
         *  forces until the max steering force magnitude is reached at which
         *  time the function returns the steering force accumulated to that 
         *  point
         */
        private SumForces() {
            let force = new Vector2D();

            //the soccer players must always tag their neighbors
            this.FindNeighbours();

            if (this.On(behavior_type.separation)) {
                force.add(mul(this.m_dMultSeparation, this.Separation()));

                if (!this.AccumulateForce(this.m_vSteeringForce, force)) {
                    return this.m_vSteeringForce;
                }
            }

            if (this.On(behavior_type.seek)) {
                force.add(this.Seek(this.m_vTarget));

                if (!this.AccumulateForce(this.m_vSteeringForce, force)) {
                    return this.m_vSteeringForce;
                }
            }

            if (this.On(behavior_type.arrive)) {
                force.add(this.Arrive(this.m_vTarget, Deceleration.fast));

                if (!this.AccumulateForce(this.m_vSteeringForce, force)) {
                    return this.m_vSteeringForce;
                }
            }

            if (this.On(behavior_type.pursuit)) {
                force.add(this.Pursuit(this.m_pBall));

                if (!this.AccumulateForce(this.m_vSteeringForce, force)) {
                    return this.m_vSteeringForce;
                }
            }

            if (this.On(behavior_type.interpose)) {
                force.add(this.Interpose(this.m_pBall, this.m_vTarget, this.m_dInterposeDist));

                if (!this.AccumulateForce(this.m_vSteeringForce, force)) {
                    return this.m_vSteeringForce;
                }
            }

            return this.m_vSteeringForce;
        }
        //    //a vertex buffer to contain the feelers rqd for dribbling
        private m_Antenna: Vector2D[];

        //------------------------- ctor -----------------------------------------
        //
        //------------------------------------------------------------------------
        constructor(agent: PlayerBase, world: SoccerPitch, ball: SoccerBall) {
            this.m_pPlayer = agent;
            this.m_iFlags = 0;
            this.m_dMultSeparation = ParamLoader.SeparationCoefficient;
            this.m_bTagged = false;
            this.m_dViewDistance = ParamLoader.ViewDistance;
            this.m_pBall = ball;
            this.m_dInterposeDist = 0.0;
            this.m_Antenna = <Vector2D[]>[];//Arrays.asList((Vector2D[]) Array.newInstance(Vector2D.class, 5));
        }

        //    @Override
        //    protected void finalize() throws Throwable {
        //        super.finalize();
        //    }

        /**
         * calculates the overall steering force based on the currently active
         * steering behaviors. 
         */
        public Calculate() {
            //reset the force
            this.m_vSteeringForce.Zero();

            //this will hold the value of each individual steering force
            this.m_vSteeringForce = this.SumForces();

            //make sure the force doesn't exceed the vehicles maximum allowable
            this.m_vSteeringForce.Truncate(this.m_pPlayer.MaxForce());

            return new Vector2D(this.m_vSteeringForce.x, this.m_vSteeringForce.y);
        }

        /**
         * calculates the component of the steering force that is parallel
         * with the vehicle heading
         */
        public ForwardComponent() {
            return this.m_pPlayer.Heading().Dot(this.m_vSteeringForce);
        }

        /**
         * calculates the component of the steering force that is perpendicuar
         * with the vehicle heading
         */
        public SideComponent() {
            return this.m_pPlayer.Side().Dot(this.m_vSteeringForce) * this.m_pPlayer.MaxTurnRate();
        }

        public Force() {
            return this.m_vSteeringForce;
        }

        //    /**
        //     * renders visual aids and info for seeing how each behavior is
        //     * calculated
        //     */
        //    public void RenderAids() {
        //        //render the steering force
        //        gdi.RedPen();
        //        gdi.Line(m_pPlayer.Pos(), add(m_pPlayer.Pos(), mul(m_vSteeringForce, 20)));
        //    }

        public Target() {
            return new Vector2D(this.m_vTarget.x, this.m_vTarget.y);
        }

        public SetTarget(t: Vector2D) {
            this.m_vTarget = new Vector2D(t.x, t.y);
        }

        public InterposeDistance() {
            return this.m_dInterposeDist;
        }

        public SetInterposeDistance(d: number) {
            this.m_dInterposeDist = d;
        }

        public Tagged() {
            return this.m_bTagged;
        }

        public Tag() {
            this.m_bTagged = true;
        }

        public UnTag() {
            this.m_bTagged = false;
        }

        public SeekOn() {
            this.m_iFlags |= behavior_type.seek;
        }

        public ArriveOn() {
            this.m_iFlags |= behavior_type.arrive;
        }

        public PursuitOn() {
            this.m_iFlags |= behavior_type.pursuit;
        }

        public SeparationOn() {
            this.m_iFlags |= behavior_type.separation;
        }

        public InterposeOn(d: number) {
            this.m_iFlags |= behavior_type.interpose;
            this.m_dInterposeDist = d;
        }

        public SeekOff() {
            if (this.On(behavior_type.seek)) {
                this.m_iFlags ^= behavior_type.seek;
            }
        }

        public ArriveOff() {
            if (this.On(behavior_type.arrive)) {
                this.m_iFlags ^= behavior_type.arrive;
            }
        }

        public PursuitOff() {
            if (this.On(behavior_type.pursuit)) {
                this.m_iFlags ^= behavior_type.pursuit;
            }
        }

        public SeparationOff() {
            if (this.On(behavior_type.separation)) {
                this.m_iFlags ^= behavior_type.separation;
            }
        }

        public InterposeOff() {
            if (this.On(behavior_type.interpose)) {
                this.m_iFlags ^= behavior_type.interpose;
            }
        }

        public SeekIsOn() {
            return this.On(behavior_type.seek);
        }

        public ArriveIsOn() {
            return this.On(behavior_type.arrive);
        }

        public PursuitIsOn() {
            return this.On(behavior_type.pursuit);
        }

        public SeparationIsOn() {
            return this.On(behavior_type.separation);
        }

        public InterposeIsOn() {
            return this.On(behavior_type.interpose);
        }
    }
}