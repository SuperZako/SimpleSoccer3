/**
 * 
//------------------------- ReturnHome: ----------------------------------
//
//  In this state the goalkeeper simply returns back to the center of
//  the goal region before changing state back to TendGoal
//------------------------------------------------------------------------
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.GoalKeeperStates;

//import SimpleSoccer.GoalKeeper;
//import common.FSM.State;
//import common.Messaging.Telegram;
namespace SimpleSoccer {

    export class ReturnHome extends State<GoalKeeper> {

        private static instance = new ReturnHome();

        //private ReturnHome() {
        //}

        constructor() {
            super();
        }

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        public getName() {
            return "ReturnHome";
        }

        //@Override
        public Enter(keeper: GoalKeeper) {
            keeper.Steering().ArriveOn();
        }

        //@Override
        public Execute(keeper: GoalKeeper) {
            keeper.Steering().SetTarget(keeper.HomeRegion().Center());

            //if close enough to home or the opponents get control over the ball,
            //change state to tend goal
            if (keeper.InHomeRegion() || !keeper.Team().InControl()) {
                keeper.ChangeState(TendGoal.Instance());
            }
        }

        //@Override
        public Exit(keeper: GoalKeeper) {
            keeper.Steering().ArriveOff();
        }

        //@Override
        public OnMessage(e: GoalKeeper, t: Telegram) {
            return false;
        }
    }
}