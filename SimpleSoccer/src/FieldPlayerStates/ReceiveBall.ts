/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.FieldPlayerStates;

//import common.D2.Vector2D;
//import static SimpleSoccer.DEFINE.*;
//import static SimpleSoccer.ParamLoader.Prm;
//import SimpleSoccer.FieldPlayer;
//import static common.Debug.DbgConsole.*;
//import common.FSM.State;
//import common.Messaging.Telegram;
//import static common.misc.utils.RandFloat;
namespace SimpleSoccer {
    export class ReceiveBall extends State<FieldPlayer> {

        public getName() {
            return "ReceiveBall";
        }
        private static instance = new ReceiveBall();

        //private ReceiveBall() {
        //}

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        //@Override
        public Enter(player: FieldPlayer) {
            //let the team know this player is receiving the ball
            player.Team().SetReceiver(player);

            //this player is also now the controlling player
            player.Team().SetControllingPlayer(player);

            //there are two types of receive behavior. One uses arrive to direct
            //the receiver to the position sent by the passer in its telegram. The
            //other uses the pursuit behavior to pursue the ball. 
            //This statement selects between them dependent on the probability
            //ChanceOfUsingArriveTypeReceiveBehavior, whether or not an opposing
            //player is close to the receiving player, and whether or not the receiving
            //player is in the opponents 'hot region' (the third of the pitch closest
            //to the opponent's goal
            const PassThreatRadius = 70.0;

            if ((player.InHotRegion() || RandFloat() < ParamLoader.ChanceOfUsingArriveTypeReceiveBehavior) && !player.Team().isOpponentWithinRadius(player.Pos(), PassThreatRadius)) {
                player.Steering().ArriveOn();

                //if (def(PLAYER_STATE_INFO_ON)) {
                //    debug_con.print("Player ").print(player.ID()).print(" enters receive state (Using Arrive)").print("");
                //}
            } else {
                player.Steering().PursuitOn();


            }

        }

        //@Override
        public Execute(player: FieldPlayer) {
            //if the ball comes close enough to the player or if his team lose control
            //he should change state to chase the ball
            if (player.BallWithinReceivingRange() || !player.Team().InControl()) {
                player.GetFSM().ChangeState(ChaseBall.Instance());

                return;
            }

            if (player.Steering().PursuitIsOn()) {
                player.Steering().SetTarget(player.Ball().Pos());
            }

            //if the player has 'arrived' at the steering target he should wait and
            //turn to face the ball
            if (player.AtTarget()) {
                player.Steering().ArriveOff();
                player.Steering().PursuitOff();
                player.TrackBall();
                player.SetVelocity(new Vector2D(0, 0));
            }
        }

        //@Override
        public Exit(player: FieldPlayer) {
            player.Steering().ArriveOff();
            player.Steering().PursuitOff();

            player.Team().SetReceiver(null);
        }

        //@Override
        public OnMessage(e: FieldPlayer, t: Telegram) {
            return false;
        }
    }
}