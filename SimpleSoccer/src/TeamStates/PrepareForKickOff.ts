/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.TeamStates;

//import SimpleSoccer.SoccerTeam;
//import common.FSM.State;
//import common.Messaging.Telegram;
namespace SimpleSoccer {
    export class PrepareForKickOff extends State<SoccerTeam> {


        public getName() {
            return "PrepareForKickOff";
        }
        private static instance = new PrepareForKickOff();

        //private PrepareForKickOff() {
        //}

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        //@Override
        public Enter(team: SoccerTeam) {
            //reset key player pointers
            team.SetControllingPlayer(null);
            team.SetSupportingPlayer(null);
            team.SetReceiver(null);
            team.SetPlayerClosestToBall(null);

            //send Msg_GoHome to each player.
            team.ReturnAllFieldPlayersToHome();
        }

        //@Override
        public Execute(team: SoccerTeam) {
            //if both teams in position, start the game
            if (team.AllPlayersAtHome() && team.Opponents().AllPlayersAtHome()) {
                team.GetFSM().ChangeState(Defending.Instance());
            }
        }

        //@Override
        public Exit(team: SoccerTeam) {
            team.Pitch().SetGameOn();
        }

        //@Override
        public OnMessage(e: SoccerTeam, t: Telegram) {
            return false;
        }
    }
}