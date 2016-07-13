/**
 * @author Petr (http://www.sallyx.org/)
 */
/* tslint:disable:no-switch-case-fall-through */

namespace SimpleSoccer {
    export class GlobalPlayerState extends State<FieldPlayer> {


        private static instance = new GlobalPlayerState();

        constructor() {
            super();
        }

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        public getName() {
            return "GlobalPlayerState";
        }


        //@Override
        public Enter(player: FieldPlayer) {
            return;
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
            return;
        }

        //@Override
        public OnMessage(player: FieldPlayer, telegram: Telegram) {
            switch (telegram.Msg) {
                case MessageTypes.ReceiveBall: {
                    //set the target
                    player.Steering().SetTarget(<Vector2>telegram.ExtraInfo);

                    //change state 
                    player.ChangeState(ReceiveBall.Instance());

                    return true;
                }
                //break;

                case MessageTypes.SupportAttacker: {
                    //if already supporting just return
                    if (player.isInState(SupportAttacker.Instance())) {
                        return true;
                    }

                    //set the target to be the best supporting position
                    player.Steering().SetTarget(player.Team().GetSupportSpot());

                    //change the state
                    player.ChangeState(SupportAttacker.Instance());

                    return true;
                }

                //break;

                case MessageTypes.Wait: {
                    //change the state
                    player.ChangeState(Wait.Instance());

                    return true;
                }
                // break;

                case MessageTypes.GoHome: {
                    player.SetDefaultHomeRegion();

                    player.ChangeState(ReturnToHomeRegion.Instance());

                    return true;
                }

                // break;

                case MessageTypes.PassToMe: {
                    //get the position of the player requesting the pass 
                    let receiver = <FieldPlayer>telegram.ExtraInfo;

                    //if (def(PLAYER_STATE_INFO_ON)) {
                    //    debug_con.print("Player ").print(player.ID()).
                    //print(" received request from ").
                    //print(receiver.ID()).print(" to make pass").print("");
                    //}

                    //if the ball is not within kicking range or their is already a 
                    //receiving player, this player cannot pass the ball to the player
                    //making the request.
                    if (player.Team().Receiver() != null || !player.BallWithinKickingRange()) {
                        //if (def(PLAYER_STATE_INFO_ON)) {
                        //    debug_con.print("Player ").print(player.ID()).
                        //print(" cannot make requested pass <cannot kick ball>").print("");
                        //}

                        return true;
                    }

                    //make the pass   
                    player.Ball().Kick(Vector2.subtract(receiver.Pos(), player.Ball().Pos()), ParamLoader.MaxPassingForce);


                    //if (def(PLAYER_STATE_INFO_ON)) {
                    //    debug_con.print("Player ").print(player.ID()).
                    //print(" Passed ball to requesting player").print("");
                    //}

                    //let the receiver know a pass is coming 
                    let message = MessageTypes.ReceiveBall;
                    MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY, player.ID(), receiver.ID(), message, receiver.Pos());



                    //change state   
                    player.ChangeState(Wait.Instance());

                    player.FindSupport();

                    return true;
                }

                //break;

            }//end switch

            return false;
        }
    }
}