/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.FieldPlayerStates;

//import static SimpleSoccer.DEFINE.*;
//import SimpleSoccer.FieldPlayer;
//import static common.Debug.DbgConsole.*;
//import common.FSM.State;
//import common.Messaging.Telegram;
namespace SimpleSoccer {
    export class ChaseBall extends State<FieldPlayer> {

        private static instance = new ChaseBall();

        //private ChaseBall() {
        //}

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        public getName() {
            return "ChaseBall";
        }

        //@Override
        public Enter(player: FieldPlayer) {
            player.Steering().SeekOn();

            //if (def(PLAYER_STATE_INFO_ON)) {
            //    debug_con.print("Player ").print(player.ID()).print(" enters chase state").print("");
            console.log("Player " + player.ID() + " enters chase state");
            //}
        }

        //@Override
        public Execute(player: FieldPlayer) {
            //if the ball is within kicking range the player changes state to KickBall.
            if (player.BallWithinKickingRange()) {
                player.ChangeState(KickBall.Instance());
                return;
            }

            //if the player is the closest player to the ball then he should keep
            //chasing it
            if (player.isClosestTeamMemberToBall()) {
                player.Steering().SetTarget(player.Ball().Pos());

                return;
            }

            //if the player is not closest to the ball anymore, he should return back
            //to his home region and wait for another opportunity
            player.ChangeState(ReturnToHomeRegion.Instance());
        }

        //@Override
        public Exit(player: FieldPlayer) {
            player.Steering().SeekOff();
        }

        //@Override
        public OnMessage(e: FieldPlayer, t: Telegram) {
            return false;
        }
    }
}