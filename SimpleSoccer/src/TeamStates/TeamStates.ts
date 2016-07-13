/**
 * Desc: State prototypes for soccer team states
 * 
 * @author Petr (http://www.sallyx.org/)
 */
/// <reference path="../SoccerTeam.ts" />

namespace SimpleSoccer {
    //export class TeamStates {

    //static {
    //    //uncomment to send state info to debug window
    //    //define(DEBUG_TEAM_STATES);
    //}

    export function ChangePlayerHomeRegions(team: SoccerTeam, NewRegions: number[]) {
        for (let plyr = 0; plyr < NewRegions.length; ++plyr) {
            team.SetPlayerHomeRegion(plyr, NewRegions[plyr]);
        }
    }
    //}
}
