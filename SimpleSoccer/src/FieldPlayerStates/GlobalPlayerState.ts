/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.FieldPlayerStates;

//import static SimpleSoccer.DEFINE.*;
//import static SimpleSoccer.MessageTypes.*;
//import SimpleSoccer.FieldPlayer;
//import static SimpleSoccer.ParamLoader.Prm;
//import common.D2.Vector2D;
//import static common.D2.Vector2D.*;
//import static common.Debug.DbgConsole.*;
//import common.FSM.State;
//import static common.Messaging.MessageDispatcher.*;
//import common.Messaging.Telegram;
namespace SimpleSoccer {
    export class GlobalPlayerState extends State<FieldPlayer> {

        public getName() {
            return "GlobalPlayerState";
        }

        static instance = new GlobalPlayerState();

        constructor() {
            super();
        }

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        //@Override
        public Enter(player: FieldPlayer) {
        }

        //@Override
        public Execute(player: FieldPlayer) {
            //if a player is in possession and close to the ball reduce his max speed
            if ((player.BallWithinReceivingRange()) && (player.isControllingPlayer())) {
                player.SetMaxSpeed(ParamLoader.PlayerMaxSpeedWithBall);
            } else {
                player.SetMaxSpeed(ParamLoader.PlayerMaxSpeedWithoutBall);
            }

        }

        //@Override
        public Exit(player: FieldPlayer) {
        }

        //@Override
        public OnMessage(player: FieldPlayer, telegram: Telegram) {
            switch (telegram.Msg) {
                case MessageTypes.Msg_ReceiveBall: {
                    //set the target
                    player.Steering().SetTarget(<Vector2D>telegram.ExtraInfo);

                    //change state 
                    player.GetFSM().ChangeState(ReceiveBall.Instance());

                    return true;
                }
                //break;

                case MessageTypes.Msg_SupportAttacker: {
                    //if already supporting just return
                    if (player.GetFSM().isInState(SupportAttacker.Instance())) {
                        return true;
                    }

                    //set the target to be the best supporting position
                    player.Steering().SetTarget(player.Team().GetSupportSpot());

                    //change the state
                    player.GetFSM().ChangeState(SupportAttacker.Instance());

                    return true;
                }

                //break;

                case MessageTypes.Msg_Wait: {
                    //change the state
                    player.GetFSM().ChangeState(Wait.Instance());

                    return true;
                }
                // break;

                case MessageTypes.Msg_GoHome: {
                    player.SetDefaultHomeRegion();

                    player.GetFSM().ChangeState(ReturnToHomeRegion.Instance());

                    return true;
                }

                // break;

                case MessageTypes.Msg_PassToMe: {
                    //get the position of the player requesting the pass 
                    let receiver = <FieldPlayer>telegram.ExtraInfo;

                    //if (def(PLAYER_STATE_INFO_ON)) {
                    //    debug_con.print("Player ").print(player.ID()).print(" received request from ").print(receiver.ID()).print(" to make pass").print("");
                    //}

                    //if the ball is not within kicking range or their is already a 
                    //receiving player, this player cannot pass the ball to the player
                    //making the request.
                    if (player.Team().Receiver() != null || !player.BallWithinKickingRange()) {
                        //if (def(PLAYER_STATE_INFO_ON)) {
                        //    debug_con.print("Player ").print(player.ID()).print(" cannot make requested pass <cannot kick ball>").print("");
                        //}

                        return true;
                    }

                    //make the pass   
                    player.Ball().Kick(sub(receiver.Pos(), player.Ball().Pos()), ParamLoader.MaxPassingForce);


                    //if (def(PLAYER_STATE_INFO_ON)) {
                    //    debug_con.print("Player ").print(player.ID()).print(" Passed ball to requesting player").print("");
                    //}

                    //let the receiver know a pass is coming 
                    MessageDispatcher.Dispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY, player.ID(), receiver.ID(), MessageTypes.Msg_ReceiveBall, receiver.Pos());



                    //change state   
                    player.GetFSM().ChangeState(Wait.Instance());

                    player.FindSupport();

                    return true;
                }

                //break;

            }//end switch

            return false;
        }
    }
}