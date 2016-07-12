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
    export class Attacking extends State<SoccerTeam> {

        private static instance = new Attacking();

        constructor() { super(); }

        // this is a singleton
        public static Instance() {
            return this.instance;
        }
        public getName() {
            return "Attacking";
        }

        // @Override
        public Enter(team: SoccerTeam) {
            //if (def(DEBUG_TEAM_STATES)) {
            //    debug_con.print(team.Name()).print(" entering Attacking state").print("");
            //}

            //these define the home regions for this state of each of the players
            const BlueRegions = [1, 12, 14, 6, 4];
            const RedRegions = [16, 3, 5, 9, 13];

            //set up the player's home regions
            if (team.isBlue()) {
                ChangePlayerHomeRegions(team, BlueRegions);
            } else {
                ChangePlayerHomeRegions(team, RedRegions);
            }

            //if a player is in either the Wait or ReturnToHomeRegion states, its
            //steering target must be updated to that of its new home region to enable
            //it to move into the correct position.
            team.UpdateTargetsOfWaitingPlayers();
        }

        // @Override
        public Execute(team: SoccerTeam) {
            //if this team is no longer in control change states
            if (!team.InControl()) {
                team.GetFSM().ChangeState(Defending.Instance());
                return;
            }

            //calculate the best position for any supporting attacker to move to
            team.DetermineBestSupportingPosition();
        }

        // @Override
        public Exit(team: SoccerTeam) {
            //there is no supporting player for defense
            team.SetSupportingPlayer(null);
        }

        // @Override
        public OnMessage(e: SoccerTeam, t: Telegram) {
            return false;
        }
    }
}