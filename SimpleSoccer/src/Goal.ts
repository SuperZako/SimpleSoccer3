/**
 * Desc:  class to define a goal for a soccer pitch. The goal is defined
 *        by two 2D vectors representing the left and right posts.
 *
 *        Each time-step the method Scored should be called to determine
 *        if a goal has been scored.
 * 
 * @author Petr (http://www.sallyx.org/)
 */
namespace SimpleSoccer {
    export class Goal {
        //a vector representing the facing direction of the goal
        //private m_vFacing: Vector2;
        //the position of the center of the goal line
        private center: Vector2;
        //each time Scored() detects a goal this is incremented
        private numGoalsScored = 0;

        constructor(private leftPost: Vector2, private rightPost: Vector2, private facing: Vector2) {
            this.center = Vector2.divide(Vector2.add(leftPost, rightPost), 2.0);
        }

        /**
         * Given the current ball position and the previous ball position,
         * this method returns true if the ball has crossed the goal line 
         * and increments m_iNumGoalsScored
         */
        public Scored(ball: SoccerBall) {
            if (LineIntersection2D(ball.Pos(), ball.OldPos(), this.leftPost, this.rightPost)) {
                ++this.numGoalsScored;

                return true;
            }

            return false;
        }

        // accessor methods
        public Center() {
            return new Vector2(this.center.x, this.center.y);
        }

        public Facing() {
            return new Vector2(this.facing.x, this.facing.y);
        }

        public LeftPost() {
            let m_vLeftPost = this.leftPost;
            return new Vector2(m_vLeftPost.x, m_vLeftPost.y);
        }

        public RightPost() {
            let rightPost = this.rightPost;
            return new Vector2(rightPost.x, rightPost.y);
        }

        //public int NumGoalsScored() {
        //    return m_iNumGoalsScored;
        //}

        //public void ResetGoalsScored() {
        //    m_iNumGoalsScored = 0;
        //}
    }
}