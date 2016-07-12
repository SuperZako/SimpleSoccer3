/**
 *  In this state the GP will attempt to intercept the ball using the
 *  pursuit steering behavior, but he only does so so long as he remains
 *  within his home region.
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.GoalKeeperStates;

//import SimpleSoccer.GoalKeeper;
//import static SimpleSoccer.DEFINE.*;
//import static common.Debug.DbgConsole.*;
//import common.FSM.State;
//import common.Messaging.Telegram;
namespace SimpleSoccer {
    export class InterceptBall extends State<GoalKeeper> {

        private static instance = new InterceptBall();

        //private InterceptBall() {
        //}
        constructor() {
            super();
        }
        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        public getName() {
            return "InterceptBall";
        }


        //@Override
        public Enter(keeper: GoalKeeper) {
            keeper.Steering().PursuitOn();

            //if (def(GOALY_STATE_INFO_ON)) {
            //    debug_con.print("Goaly ").print(keeper.ID()).print(" enters InterceptBall").print("");
            //}
        }

        //@Override
        public Execute(keeper: GoalKeeper) {
            //if the goalkeeper moves to far away from the goal he should return to his
            //home region UNLESS he is the closest player to the ball, in which case,
            //he should keep trying to intercept it.
            if (keeper.TooFarFromGoalMouth() && !keeper.isClosestPlayerOnPitchToBall()) {
                keeper.ChangeState(ReturnHome.Instance());
                return;
            }

            //if the ball becomes in range of the goalkeeper's hands he traps the 
            //ball and puts it back in play
            if (keeper.BallWithinKeeperRange()) {
                keeper.Ball().Trap();

                keeper.Pitch().SetGoalKeeperHasBall(true);

                keeper.ChangeState(PutBallBackInPlay.Instance());

                return;
            }
        }

        //@Override
        public Exit(keeper: GoalKeeper) {
            keeper.Steering().PursuitOff();
        }

        //@Override
        public OnMessage(e: GoalKeeper, t: Telegram) {
            return false;
        }
    }

}