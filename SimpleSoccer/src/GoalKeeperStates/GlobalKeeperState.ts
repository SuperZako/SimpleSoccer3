/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.GoalKeeperStates;

//import SimpleSoccer.GoalKeeper;
//import common.FSM.State;
//import common.Messaging.Telegram;
namespace SimpleSoccer {
    export class GlobalKeeperState extends State<GoalKeeper> {

        public getName() {
            return "GlobalKeeperState";
        }

        private static instance = new GlobalKeeperState();

        constructor() {
            super();
        }

        public static Instance() {
            return this.instance;
        }

        //@Override
        public Enter(keeper: GoalKeeper) {
        }

        //@Override
        public Execute(keeper: GoalKeeper) {
        }

        //@Override
        public Exit(keeper: GoalKeeper) {
        }

        //@Override
        public OnMessage(keeper: GoalKeeper, telegram: Telegram) {
            switch (telegram.Msg) {
                case MessageTypes.Msg_GoHome: {
                    keeper.SetDefaultHomeRegion();
                    keeper.GetFSM().ChangeState(ReturnHome.Instance());
                }

                    break;

                case MessageTypes.Msg_ReceiveBall: {
                    keeper.GetFSM().ChangeState(InterceptBall.Instance());
                }

                    break;

            }//end switch

            return false;
        }
    }
}