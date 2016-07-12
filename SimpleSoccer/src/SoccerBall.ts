
/// <reference path="./MovingEntity.ts" />


/**
 *  Desc: Class to implement a soccer ball. This class inherits from
 *        MovingEntity and provides further functionality for collision
 *        testing and position prediction.
 * 
 * @author Petr (http://www.sallyx.org/)
 */


namespace SimpleSoccer {
    export class SoccerBall extends MovingEntity {

        // keeps a record of the ball's position at the last update
        private m_vOldPos: Vector2;
        // a local reference to the Walls that make up the pitch boundary
        //private m_PitchBoundary: Wall2D[];

        public constructor(pos: Vector2, BallSize: number, mass: number, private pitchBoundary: Wall2D[]) {

            // set up the base class
            super(pos, BallSize, new Vector2(0, 0),
                -1.0, // max speed - unused
                new Vector2(0, 1),
                mass,
                new Vector2(1.0, 1.0), // scale     - unused
                0, // turn rate - unused
                0);                  // max force - unused
            //this.m_PitchBoundary = PitchBoundary;
        }

        /**
         *  this can be used to vary the accuracy of a player's kick. Just call it 
         *  prior to kicking the ball using the ball's position and the ball target as
         *  parameters.
        */
        public static AddNoiseToKick(BallPos: Vector2, BallTarget: Vector2) {

            let displacement = (Pi - Pi * ParamLoader.PlayerKickingAccuracy) * RandInRange(-1, 1); // RandomClamped();

            let toTarget = sub(BallTarget, BallPos);

            Vec2DRotateAroundOrigin(toTarget, displacement);

            return add(toTarget, BallPos);
        }

        /**
         * tests to see if the ball has collided with a ball and reflects 
         * the ball's velocity accordingly
         */
        public TestCollisionWithWalls(walls: Wall2D[]) {
            //test ball against each wall, find out which is closest
            let idxClosest = -1;

            let VelNormal = Vec2DNormalize(this.m_vVelocity);

            let IntersectionPoint: Vector2;
            let CollisionPoint = new Vector2();

            let DistToIntersection = MaxFloat;

            /**
             * iterate through each wall and calculate if the ball intersects.
             * If it does then store the index into the closest intersecting wall
             */
            for (let w = 0; w < walls.length; ++w) {
                let wall = walls[w];
                //assuming a collision if the ball continued on its current heading 
                //calculate the point on the ball that would hit the wall. This is 
                //simply the wall's normal(inversed) multiplied by the ball's radius
                //and added to the balls center (its position)
                let ThisCollisionPoint = sub(this.Pos(), (mul(this.BRadius(), walls[w].Normal())));

                //calculate exactly where the collision point will hit the plane    
                if (WhereIsPoint(ThisCollisionPoint, walls[w].From(), walls[w].Normal()) === span_type.plane_backside) {
                    let DistToWall = DistanceToRayPlaneIntersection(ThisCollisionPoint, wall.Normal(), wall.From(), wall.Normal());

                    IntersectionPoint = add(ThisCollisionPoint, (mul(DistToWall, walls[w].Normal())));

                } else {
                    let DistToWall = DistanceToRayPlaneIntersection(ThisCollisionPoint, VelNormal, walls[w].From(), walls[w].Normal());

                    IntersectionPoint = add(ThisCollisionPoint, (mul(DistToWall, VelNormal)));
                }

                //check to make sure the intersection point is actually on the line
                //segment
                let OnLineSegment = false;

                let a = wall.From();
                let b = wall.To();
                let c = sub(ThisCollisionPoint, mul(20.0, wall.Normal()));
                let d = add(ThisCollisionPoint, mul(20.0, wall.Normal()));
                if (LineIntersection2D(a, b, c, d)) {

                    OnLineSegment = true;
                }


                //Note, there is no test for collision with the end of a line segment

                //now check to see if the collision point is within range of the
                //velocity vector. [work in distance squared to avoid sqrt] and if it
                //is the closest hit found so far. 
                //If it is that means the ball will collide with the wall sometime
                //between this time step and the next one.
                let distSq = Vec2DDistanceSq(ThisCollisionPoint, IntersectionPoint);

                if ((distSq <= this.m_vVelocity.LengthSq()) && (distSq < DistToIntersection) && OnLineSegment) {
                    DistToIntersection = distSq;
                    idxClosest = w;
                    CollisionPoint = IntersectionPoint;
                }
            }//next wall


            //to prevent having to calculate the exact time of collision we
            //can just check if the velocity is opposite to the wall normal
            //before reflecting it. This prevents the case where there is overshoot
            //and the ball gets reflected back over the line before it has completely
            //reentered the playing area.
            if ((idxClosest >= 0) && VelNormal.dot(walls[idxClosest].Normal()) < 0) {
                this.m_vVelocity.Reflect(walls[idxClosest].Normal());
            }
        }

        /**
         * updates the ball physics, tests for any collisions and adjusts
         * the ball's velocity accordingly
         */
        //@Override
        public Update() {
            //keep a record of the old position so the goal::scored method
            //can utilize it for goal testing
            this.m_vOldPos = new Vector2(this.position.x, this.position.y);

            //Test for collisions
            this.TestCollisionWithWalls(this.pitchBoundary);

            //Simulate Prm.Friction. Make sure the speed is positive 
            //first though
            if (this.m_vVelocity.LengthSq() > ParamLoader.Friction * ParamLoader.Friction) {
                this.m_vVelocity.add(mul(ParamLoader.Friction, Vec2DNormalize(this.m_vVelocity)));
                this.position.add(this.m_vVelocity);


                //update heading
                this.m_vHeading = Vec2DNormalize(this.m_vVelocity);
            }
        }

        /**
         * Renders the ball
         */
        //@Override
        public Render(ctx: CanvasRenderingContext2D) {
            //    gdi.BlackBrush();

            //    gdi.Circle(m_vPosition, m_dBoundingRadius);
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.arc(this.position.x, this.position.y, this.boundingRadius, 0, Math.PI * 2, false);
            ctx.fill();
            //    /*
            //    gdi.GreenBrush();
            //    for (int i=0; i<IPPoints.size(); ++i)
            //    {
            //    gdi.Circle(IPPoints[i], 3);
            //    }
            //     */
        }

        ////a soccer ball doesn't need to handle messages
        //@Override
        public HandleMessage(msg: Telegram) {
            return false;
        }

        /**
         * applys a force to the ball in the direction of heading. Truncates
         * the new velocity to make sure it doesn't exceed the max allowable.
         */
        public Kick(direction: Vector2, force: number) {
            //ensure direction is normalized
            direction.Normalize();

            //calculate the acceleration
            let acceleration = div(mul(force, direction), this.m_dMass);

            //update the velocity
            this.m_vVelocity = acceleration;
        }

        /**
         * Given a force and a distance to cover given by two vectors, this
         * method calculates how long it will take the ball to travel between
         * the two points
         */
        public TimeToCoverDistance(A: Vector2, B: Vector2, force: number) {
            //this will be the velocity of the ball in the next time step *if*
            //the player was to make the pass. 
            let speed = force / this.m_dMass;

            //calculate the velocity at B using the equation
            //
            //  v^2 = u^2 + 2as
            //

            //first calculate s (the distance between the two positions)
            let DistanceToCover = Vec2DDistance(A, B);

            let term = speed * speed + 2.0 * DistanceToCover * ParamLoader.Friction;

            //if  (u^2 + 2as) is negative it means the ball cannot reach point B.
            if (term <= 0.0) {
                return -1.0;
            }

            let v = Math.sqrt(term);

            //it IS possible for the ball to reach B and we know its speed when it
            //gets there, so now it's easy to calculate the time using the equation
            //
            //    t = v-u
            //        ---
            //         a
            //
            return (v - speed) / ParamLoader.Friction;
        }

        /**
         * given a time this method returns the ball position at that time in the
         *  future
         */
        public FuturePosition(time: number) {
            //using the equation s = ut + 1/2at^2, where s = distance, a = friction
            //u=start velocity

            //calculate the ut term, which is a vector
            let ut = mul(time, this.m_vVelocity);

            //calculate the 1/2at^2 term, which is scalar
            let half_a_t_squared = 0.5 * ParamLoader.Friction * time * time;

            //turn the scalar quantity into a vector by multiplying the value with
            //the normalized velocity vector (because that gives the direction)
            let ScalarToVector = mul(half_a_t_squared, Vec2DNormalize(this.m_vVelocity));

            //the predicted position is the balls position plus these two terms
            return add(this.Pos(), ut).add(ScalarToVector);
        }

        /**
         * this is used by players and goalkeepers to 'trap' a ball -- to stop
         * it dead. That player is then assumed to be in possession of the ball
         * and m_pOwner is adjusted accordingly
         */
        public Trap() {
            this.m_vVelocity.Zero();
        }

        public OldPos() {
            return new Vector2(this.m_vOldPos.x, this.m_vOldPos.y);
        }

        /**
         * positions the ball at the desired location and sets the ball's velocity to
         *  zero
         */
        public PlaceAtPosition(NewPos: Vector2) {
            this.position = new Vector2(NewPos.x, NewPos.y);

            this.m_vOldPos = new Vector2(this.position.x, this.position.y);

            this.m_vVelocity.Zero();
        }


    }
}
