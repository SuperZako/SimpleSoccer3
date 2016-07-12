/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.GoalKeeperStates;

//import SimpleSoccer.GoalKeeper;
//import static SimpleSoccer.ParamLoader.Prm;
//import static SimpleSoccer.MessageTypes.*;
//import SimpleSoccer.PlayerBase;
//import common.D2.Vector2D;
//import static common.D2.Vector2D.*;
//import common.FSM.State;
//import common.Messaging.Telegram;
//import static common.Messaging.MessageDispatcher.*;
//import common.misc.CppToJava.ObjectRef;
namespace SimpleSoccer {
    export class PutBallBackInPlay extends State<GoalKeeper> {

        private static instance = new PutBallBackInPlay();

        constructor() {
            super();
        }

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        public getName() {
            return "PutBallBackInPlay";
        }


        //@Override
        public Enter(keeper: GoalKeeper) {
            //let the team know that the keeper is in control
            keeper.Team().SetControllingPlayer(keeper);

            //send all the players home
            keeper.Team().Opponents().ReturnAllFieldPlayersToHome();
            keeper.Team().ReturnAllFieldPlayersToHome();
        }

        //@Override
        public Execute(keeper: GoalKeeper) {

            //let BallTarget = new Vector2D();

            //ObjectRef < PlayerBase > receiverRef = new ObjectRef<PlayerBase>(receiver);
            //let receiverRef = receiver;
            //test if there are players further forward on the field we might
            //be able to pass to. If so, make a pass.
            let result = keeper.Team().FindPass(keeper, ParamLoader.MaxPassingForce, ParamLoader.GoalkeeperMinPassDistance);
            if (result.receiver) {

                //make the pass   
                keeper.Ball().Kick(Vec2DNormalize(sub(result.PassTarget, keeper.Ball().Pos())), ParamLoader.MaxPassingForce);

                //goalkeeper no longer has ball 
                keeper.Pitch().SetGoalKeeperHasBall(false);

                //let the receiving player know the ball's comin' at him
                let message = MessageTypes.Msg_ReceiveBall;
                MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY, keeper.ID(), result.receiver.ID(), message, result.PassTarget);

                //go back to tending the goal   
                keeper.ChangeState(TendGoal.Instance());

                return;
            }

            keeper.SetVelocity(new Vector2D());
        }

        //@Override
        public Exit(keeper: GoalKeeper) {
            return;
        }

        //@Override
        public OnMessage(e: GoalKeeper, t: Telegram) {
            return false;
        }
    }
}