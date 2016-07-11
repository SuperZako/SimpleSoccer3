///**
// *  Desc:   A base class defining an entity that moves. The entity has 
// *          a local coordinate system and members for defining its
// *          mass and velocity.
// * 
// * @author Petr (http://www.sallyx.org/)
// */
//package SimpleSoccer;

//import common.D2.Vector2D;
//import common.D2.C2DMatrix;
//import static common.D2.Vector2D.*;

///<reference path='BaseGameEntity.ts' />

namespace SimpleSoccer {
    export abstract class MovingEntity extends BaseGameEntity {

        protected m_vVelocity: Vector2D;
        //a normalized vector pointing in the direction the entity is heading. 
        protected m_vHeading: Vector2D;
        //a vector perpendicular to the heading vector
        protected m_vSide: Vector2D;
        protected m_dMass: number;
        //the maximum speed this entity may travel at.
        protected m_dMaxSpeed: number;
        //the maximum force this entity can produce to power itself 
        //(think rockets and thrust)
        protected m_dMaxForce: number;
        //the maximum rate (radians per second)this vehicle can rotate         
        protected m_dMaxTurnRate: number;

        constructor(position: Vector2D, radius: number, velocity: Vector2D, max_speed: number, heading: Vector2D, mass: number, scale: Vector2D, turn_rate: number, max_force: number) {
            super(BaseGameEntity.GetNextValidID());
            this.m_vHeading = new Vector2D(heading.x, heading.y);
            this.m_vVelocity = new Vector2D(velocity.x, velocity.y);
            this.m_dMass = mass;
            this.m_vSide = this.m_vHeading.Perp();
            this.m_dMaxSpeed = max_speed;
            this.m_dMaxTurnRate = turn_rate;
            this.m_dMaxForce = max_force;

            this.m_vPosition = new Vector2D(position.x, position.y);
            this.m_dBoundingRadius = radius;
            this.m_vScale = new Vector2D(scale.x, scale.y);
        }

        //@Override
        //protected void finalize() throws Throwable {
        //    super.finalize();
        //}

        //accessors
        public Velocity() {
            return new Vector2D(this.m_vVelocity.x, this.m_vVelocity.y);
        }

        public SetVelocity(NewVel: Vector2D) {
            this.m_vVelocity = NewVel;
        }

        public Mass() {
            return this.m_dMass;
        }

        public Side() {
            return this.m_vSide;
        }

        public MaxSpeed() {
            return this.m_dMaxSpeed;
        }

        public SetMaxSpeed(new_speed: number) {
            this.m_dMaxSpeed = new_speed;
        }

        public MaxForce() {
            return this.m_dMaxForce;
        }

        public SetMaxForce(mf: number) {
            this.m_dMaxForce = mf;
        }

        public IsSpeedMaxedOut() {
            return this.m_dMaxSpeed * this.m_dMaxSpeed >= this.m_vVelocity.LengthSq();
        }

        public Speed() {
            return this.m_vVelocity.Length();
        }

        public SpeedSq() {
            return this.m_vVelocity.LengthSq();
        }

        public Heading() {
            return this.m_vHeading;
        }

        public MaxTurnRate() {
            return this.m_dMaxTurnRate;
        }

        public SetMaxTurnRate(val: number) {
            this.m_dMaxTurnRate = val;
        }

        /**
         *  given a target position, this method rotates the entity's heading and
         *  side vectors by an amount not greater than m_dMaxTurnRate until it
         *  directly faces the target.
         *
         *  @return true when the heading is facing in the desired direction
         */
        public RotateHeadingToFacePosition(target: Vector2D) {
            let toTarget = Vec2DNormalize(sub(target, this.m_vPosition));

            //first determine the angle between the heading vector and the target
            let angle = Math.acos(this.m_vHeading.Dot(toTarget));

            //sometimes m_vHeading.Dot(toTarget) == 1.000000002
            if (/*Double.isNaN(angle)*/ isNaN(angle)) {
                angle = 0;
            }
            //return true if the player is facing the target
            if (angle < 0.00001) {
                return true;
            }

            //clamp the amount to turn to the max turn rate
            if (angle > this.m_dMaxTurnRate) {
                angle = this.m_dMaxTurnRate;
            }

            //The next few lines use a rotation matrix to rotate the player's heading
            //vector accordingly
            let RotationMatrix = new C2DMatrix();

            //notice how the direction of rotation has to be determined when creating
            //the rotation matrix
            RotationMatrix.Rotate(angle * this.m_vHeading.Sign(toTarget));
            RotationMatrix.TransformVector2Ds(this.m_vHeading);
            RotationMatrix.TransformVector2Ds(this.m_vVelocity);

            //finally recreate m_vSide
            this.m_vSide = this.m_vHeading.Perp();

            return false;
        }

        /**
         *  first checks that the given heading is not a vector of zero length. If the
         *  new heading is valid this fumction sets the entity's heading and side 
         *  vectors accordingly
         */
        public SetHeading(new_heading: Vector2D) {
            //assert((new_heading.LengthSq() - 1.0) < 0.00001);

            this.m_vHeading = new_heading;

            //the side vector must always be perpendicular to the heading
            this.m_vSide = this.m_vHeading.Perp();
        }
    }
}