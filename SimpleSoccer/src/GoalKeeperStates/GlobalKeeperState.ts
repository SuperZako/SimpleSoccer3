/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.GoalKeeperStates;

//import SimpleSoccer.GoalKeeper;
//import common.FSM.State;
//import common.Messaging.Telegram;
namespace SimpleSoccer {
    export class GlobalKeeperState extends State<GoalKeeper> {

        private static instance = new GlobalKeeperState();

        constructor() {
            super();
        }

        public static Instance() {
            return this.instance;
        }

        public getName() {
            return "GlobalKeeperState";
        }

        //@Override
        public Enter(keeper: GoalKeeper) {
            return;
        }

        //@Override
        public Execute(keeper: GoalKeeper) {
            return;
        }

        //@Override
        public Exit(keeper: GoalKeeper) {
            return;
        }

        //@Override
        public OnMessage(keeper: GoalKeeper, telegram: Telegram) {
            switch (telegram.Msg) {
                case MessageTypes.Msg_GoHome: {
                    keeper.SetDefaultHomeRegion();
                    keeper.ChangeState(ReturnHome.Instance());
                }

                    break;

                case MessageTypes.Msg_ReceiveBall: {
                    keeper.ChangeState(InterceptBall.Instance());
                }

                    break;

            }//end switch

            return false;
        }
    }
}