/**
 * @author Petr (http://www.sallyx.org/)
 */

namespace SimpleSoccer {
    export class KickBall extends State<FieldPlayer> {



        private static instance = new KickBall();

        //private KickBall() {
        //}

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        public getName() {
            return "KickBall";
        }

        //@Override
        public Enter(player: FieldPlayer) {
            //let the team know this player is controlling
            player.Team().SetControllingPlayer(player);

            //the player can only make so many kick attempts per second.
            if (!player.isReadyForNextKick()) {
                player.ChangeState(ChaseBall.Instance());
            }


            //if (def(PLAYER_STATE_INFO_ON)) {
            //debug_con.print("Player ").print(player.ID()).print(" enters kick state").print("");
            console.log("Player " + player.ID() + " enters kick state");
            //}
        }

        //@Override
        public Execute(player: FieldPlayer) {
            //calculate the dot product of the vector pointing to the ball
            //and the player's heading
            let ToBall = Vector2.subtract(player.Ball().Pos(), player.Pos());
            let dot = player.Heading().dot(Vec2DNormalize(ToBall));

            //cannot kick the ball if the goalkeeper is in possession or if it is 
            //behind the player or if there is already an assigned receiver. So just
            //continue chasing the ball
            if (player.Team().Receiver() !== null || player.Pitch().GoalKeeperHasBall() || (dot < 0)) {
                //if (def(PLAYER_STATE_INFO_ON)) {
                //    debug_con.print("Goaly has ball / ball behind player").print("");
                console.log("Goaly has ball / ball behind player");
                //}

                player.ChangeState(ChaseBall.Instance());

                return;
            }

            /* Attempt a shot at the goal */

            //if a shot is possible, this vector will hold the position along the 
            //opponent's goal line the player should aim for.
            //let BallTarget = new Vector2();

            //the dot product is used to adjust the shooting force. The more
            //directly the ball is ahead, the more forceful the kick
            let power = ParamLoader.MaxShootingForce * dot;

            //if it is determined that the player could score a goal from this position
            //OR if he should just kick the ball anyway, the player will attempt
            //to make the shot
            let ShotTarget = player.Team().CanShoot(player.Ball().Pos(), power);
            if (ShotTarget || (RandFloat() < ParamLoader.ChancePlayerAttemptsPotShot)) {
                //if (def(PLAYER_STATE_INFO_ON)) {
                //    debug_con.print("Player ").print(player.ID()).print(" attempts a shot at ").print(BallTarget).print("");
                //}

                //add some noise to the kick. We don't want players who are 
                //too accurate! The amount of noise can be adjusted by altering
                //Prm.PlayerKickingAccuracy
                let BallTarget = SoccerBall.AddNoiseToKick(player.Ball().Pos(), ShotTarget);

                //this is the direction the ball will be kicked in
                let KickDirection = Vector2.subtract(BallTarget, player.Ball().Pos());

                player.Ball().Kick(KickDirection, power);

                //change state   
                player.ChangeState(Wait.Instance());

                player.FindSupport();

                return;
            }


            /* Attempt a pass to a player */

            //if a receiver is found this will point to it


            power = ParamLoader.MaxPassingForce * dot;

            //test if there are any potential candidates available to receive a pass
            let result = player.Team().FindPass(player, power, ParamLoader.MinPassDistance);
            if (player.isThreatened() && result.receiver) {
                //receiver = receiverRef;//.get();
                //add some noise to the kick
                let BallTarget = SoccerBall.AddNoiseToKick(player.Ball().Pos(), result.PassTarget);

                let KickDirection = Vector2.subtract(BallTarget, player.Ball().Pos());

                player.Ball().Kick(KickDirection, power);

                //if (def(PLAYER_STATE_INFO_ON)) {
                console.log(
                    "Player " + player.ID() + " passes the ball with force " +
                    power + "  to player " + result.receiver.ID() +
                    "  Target is " + BallTarget.x + "," + BallTarget.y);
                //}


                //let the receiver know a pass is coming 
                let message = MessageTypes.ReceiveBall;
                MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY, player.ID(), result.receiver.ID(), message, BallTarget);


                //the player should wait at his current position unless instruced
                //otherwise  
                player.ChangeState(Wait.Instance());

                player.FindSupport();

                return;
            }
            // cannot shoot or pass, so dribble the ball upfield
            player.FindSupport();

            player.ChangeState(Dribble.Instance());

        }

        //@Override
        public Exit(player: FieldPlayer) {
            return;
        }

        //@Override
        public OnMessage(e: FieldPlayer, t: Telegram) {
            return false;
        }
    }
}