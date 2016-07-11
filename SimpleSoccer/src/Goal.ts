/**
 * Desc:  class to define a goal for a soccer pitch. The goal is defined
 *        by two 2D vectors representing the left and right posts.
 *
 *        Each time-step the method Scored should be called to determine
 *        if a goal has been scored.
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer;

//import common.D2.Vector2D;
//import static common.D2.Vector2D.*;
//import static common.D2.geometry.*;
namespace SimpleSoccer {
    export class Goal {

        private m_vLeftPost: Vector2D;
        private m_vRightPost: Vector2D;
        //a vector representing the facing direction of the goal
        private m_vFacing: Vector2D;
        //the position of the center of the goal line
        private m_vCenter: Vector2D;
        //each time Scored() detects a goal this is incremented
        private m_iNumGoalsScored: number;

        constructor(left: Vector2D, right: Vector2D, facing: Vector2D) {
            this.m_vLeftPost = left;
            this.m_vRightPost = right;
            this.m_vCenter = div(add(left, right), 2.0);
            this.m_iNumGoalsScored = 0;
            this.m_vFacing = facing;
        }

        /**
         * Given the current ball position and the previous ball position,
         * this method returns true if the ball has crossed the goal line 
         * and increments m_iNumGoalsScored
         */
        public Scored(ball: SoccerBall) {
            if (LineIntersection2D(ball.Pos(), ball.OldPos(), this.m_vLeftPost, this.m_vRightPost)) {
                ++this.m_iNumGoalsScored;

                return true;
            }

            return false;
        }

        //-----------------------------------------------------accessor methods
        public Center() {
            return new Vector2D(this.m_vCenter.x, this.m_vCenter.y);
        }

        public Facing() {
            return new Vector2D(this.m_vFacing.x, this.m_vFacing.y);
        }

        public LeftPost() {
            let m_vLeftPost = this.m_vLeftPost;
            return new Vector2D(m_vLeftPost.x, m_vLeftPost.y);
        }

        public RightPost() {
            let m_vRightPost = this.m_vRightPost;
            return new Vector2D(m_vRightPost.x, m_vRightPost.y);
        }

        //public int NumGoalsScored() {
        //    return m_iNumGoalsScored;
        //}

        //public void ResetGoalsScored() {
        //    m_iNumGoalsScored = 0;
        //}
    }
}