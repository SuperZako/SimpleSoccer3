/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.TeamStates;

//import SimpleSoccer.SoccerTeam;
//import static SimpleSoccer.DEFINE.*;
//import static SimpleSoccer.TeamStates.TeamStates.ChangePlayerHomeRegions;
//import static common.Debug.DbgConsole.*;
//import common.FSM.State;
//import common.Messaging.Telegram;
namespace SimpleSoccer {
    export class Defending extends State<SoccerTeam> {

        private static instance = new Defending();

        constructor() { super(); }

        // this is a singleton
        public static Instance() {
            return this.instance;
        }
        public getName() {
            return "Defending";
        }
        //@Override
        public Enter(team: SoccerTeam) {
            //if (def(DEBUG_TEAM_STATES)) {
            //    debug_con.print(team.Name()).print(" entering Defending state").print("");
            //}

            //these define the home regions for this state of each of the players
            const BlueRegions = [1, 6, 8, 3, 5];
            const RedRegions = [16, 9, 11, 12, 14];

            //set up the player's home regions
            if (team.Color() === SoccerTeam.blue) {
                ChangePlayerHomeRegions(team, BlueRegions);
            } else {
                ChangePlayerHomeRegions(team, RedRegions);
            }

            //if a player is in either the Wait or ReturnToHomeRegion states, its
            //steering target must be updated to that of its new home region
            team.UpdateTargetsOfWaitingPlayers();
        }

        // @Override
        public Execute(team: SoccerTeam) {
            //if in control change states
            if (team.InControl()) {
                team.GetFSM().ChangeState(Attacking.Instance());
                return;
            }
        }

        // @Override
        public Exit(team: SoccerTeam) {
            return;
        }

        // @Override
        public OnMessage(e: SoccerTeam, t: Telegram) {
            return false;
        }
    }
}