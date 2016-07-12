/**
 * @author Petr (http://www.sallyx.org/)
 */
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
                case MessageTypes.GoHome:
                    keeper.SetDefaultHomeRegion();
                    keeper.ChangeState(ReturnHome.Instance());
                    break;

                case MessageTypes.ReceiveBall:
                    keeper.ChangeState(InterceptBall.Instance());
                    break;

            }//end switch

            return false;
        }
    }
}