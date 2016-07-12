/// <reference path="./common/Game/Region.ts" />

/**
 *  Desc:   A SoccerPitch is the main game object. It owns instances of
 *          two soccer teams, two goals, the playing area, the ball
 *          etc. This is the root class for all the game updates and
 *          renders etc
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer;

//import SimpleSoccer.TeamStates.PrepareForKickOff;
//import common.misc.Cgdi;
//import common.D2.Vector2D;
//import common.Game.Region;
//import common.D2.Wall2D;
//import java.lang.reflect.Array;
//import java.util.List;
//import java.util.ArrayList;
//import java.util.Arrays;
//import static SimpleSoccer.ParamLoader.Prm;
//import static common.misc.Cgdi.gdi;
//import static common.misc.Stream_Utility_function.ttos;
namespace SimpleSoccer {
    export class SoccerPitch {

        //    public static final int
        public NumRegionsHorizontal = 6;
        //    public static final int 
        public NumRegionsVertical = 3;
        //    private SoccerBall 
        private m_pBall: SoccerBall;
        //    private SoccerTeam 
        private m_pRedTeam: SoccerTeam;
        //    private SoccerTeam
        private m_pBlueTeam: SoccerTeam;

        private m_pRedGoal: Goal;
        private m_pBlueGoal: Goal;

        // container for the boundary walls
        private m_vecWalls: Wall2D[] = []; // new ArrayList<Wall2D>();

        // defines the dimensions of the playing area
        private m_pPlayingArea: Region;

        // the playing field is broken up into regions that the team
        // can make use of to implement strategies.
        private m_Regions: Region[];

        // true if a goal keeper has possession
        private m_bGoalKeeperHasBall: boolean;

        // true if the game is in play. Set to false whenever the players
        // are getting ready for kickoff
        private m_bGameOn: boolean;
        // set true to pause the motion
        private m_bPaused: boolean;
        // local copy of client window dimensions
        private m_cxClient: number;
        private m_cyClient: number;



        //------------------------------- ctor -----------------------------------
        constructor(cx: number, cy: number) {
            this.m_cxClient = cx;
            this.m_cyClient = cy;
            this.m_bPaused = false;
            this.m_bGoalKeeperHasBall = false;

            let NumRegionsHorizontal = this.NumRegionsHorizontal;
            let NumRegionsVertical = this.NumRegionsVertical;
            this.m_Regions = new Array(NumRegionsHorizontal * NumRegionsVertical);

            this.m_bGameOn = true;
            // define the playing area
            this.m_pPlayingArea = new Region(20, 20, cx - 20, cy - 20);
            let playingArea = this.m_pPlayingArea;

            // create the regions  
            this.CreateRegions(playingArea.Width() / NumRegionsHorizontal, playingArea.Height() / NumRegionsVertical);

            // create the goals
            let goalWidth = ParamLoader.GoalWidth;
            let left = new Vector2D(playingArea.Left(), (cy - goalWidth) / 2);
            let right = new Vector2D(playingArea.Left(), cy - (cy - goalWidth) / 2);
            this.m_pRedGoal = new Goal(left, right, new Vector2D(1, 0));


            left = new Vector2D(this.m_pPlayingArea.Right(), (cy - ParamLoader.GoalWidth) / 2);
            right = new Vector2D(this.m_pPlayingArea.Right(), cy - (cy - ParamLoader.GoalWidth) / 2);
            this.m_pBlueGoal = new Goal(left, right, new Vector2D(-1, 0));


            //create the soccer ball
            let position = new Vector2D(this.m_cxClient / 2.0, this.m_cyClient / 2.0);
            this.m_pBall = new SoccerBall(position, ParamLoader.BallSize, ParamLoader.BallMass, this.m_vecWalls);


            //create the teams 
            this.m_pRedTeam = new SoccerTeam(this.m_pRedGoal, this.m_pBlueGoal, this, SoccerTeam.red);
            this.m_pBlueTeam = new SoccerTeam(this.m_pBlueGoal, this.m_pRedGoal, this, SoccerTeam.blue);

            //make sure each team knows who their opponents are
            this.m_pRedTeam.SetOpponents(this.m_pBlueTeam);
            this.m_pBlueTeam.SetOpponents(this.m_pRedTeam);

            //create the walls
            let TopLeft = new Vector2D(this.m_pPlayingArea.Left(), this.m_pPlayingArea.Top());
            let TopRight = new Vector2D(this.m_pPlayingArea.Right(), this.m_pPlayingArea.Top());
            let BottomRight = new Vector2D(this.m_pPlayingArea.Right(), this.m_pPlayingArea.Bottom());
            let BottomLeft = new Vector2D(this.m_pPlayingArea.Left(), this.m_pPlayingArea.Bottom());

            this.m_vecWalls.push(new Wall2D(BottomLeft, this.m_pRedGoal.RightPost()));
            this.m_vecWalls.push(new Wall2D(this.m_pRedGoal.LeftPost(), TopLeft));
            this.m_vecWalls.push(new Wall2D(TopLeft, TopRight));
            this.m_vecWalls.push(new Wall2D(TopRight, this.m_pBlueGoal.LeftPost()));
            this.m_vecWalls.push(new Wall2D(this.m_pBlueGoal.RightPost(), BottomRight));
            this.m_vecWalls.push(new Wall2D(BottomRight, BottomLeft));

            //ParamLoader p = ParamLoader.Instance(); // WTF??
        }

        ////-------------------------------- dtor ----------------------------------
        ////------------------------------------------------------------------------
        //@Override
        //protected void finalize() throws Throwable {
        //    super.finalize();
        //    m_pBall = null;

        //    m_pRedTeam = null;
        //    m_pBlueTeam = null;

        //    m_pRedGoal = null;
        //    m_pBlueGoal = null;

        //    m_pPlayingArea = null;

        //    for (int i = 0; i < m_Regions.size(); ++i) {
        //        m_Regions.set(i, null);
        //    }
        //}
        //    static int tick = 0;

        /**
         *  this demo works on a fixed frame rate (60 by default) so we don't need
         *  to pass a time_elapsed as a parameter to the game entities
         */
        public Update() {
            if (this.m_bPaused) {
                return;
            }

            //update the balls
            this.m_pBall.Update();

            //update the teams
            this.m_pRedTeam.Update();
            this.m_pBlueTeam.Update();

            //if a goal has been detected reset the pitch ready for kickoff
            if (this.m_pBlueGoal.Scored(this.m_pBall) || this.m_pRedGoal.Scored(this.m_pBall)) {
                this.m_bGameOn = false;

                //reset the ball                                                      
                this.m_pBall.PlaceAtPosition(new Vector2D(this.m_cxClient / 2.0, this.m_cyClient / 2.0));

                //get the teams ready for kickoff
                this.m_pRedTeam.GetFSM().ChangeState(PrepareForKickOff.Instance());
                this.m_pBlueTeam.GetFSM().ChangeState(PrepareForKickOff.Instance());
            }
        }

        ////------------------------------ Render ----------------------------------
        ////------------------------------------------------------------------------
        public Render(ctx: CanvasRenderingContext2D) {
            //    //draw the grass
            //    gdi.DarkGreenPen();
            //    gdi.DarkGreenBrush();
            //    gdi.Rect(0, 0, m_cxClient, m_cyClient);
            ctx.fillStyle = "rgb(0, 100, 0)";
            ctx.fillRect(0, 0, this.m_cxClient, this.m_cyClient);

            //    //render regions
            //    if (Prm.bRegions) {
            //        for (int r = 0; r < m_Regions.size(); ++r) {
            //            m_Regions.get(r).Render(true);
            //        }
            //    }

            //    //render the goals
            //    gdi.HollowBrush();
            //    gdi.RedPen();
            //    gdi.Rect(m_pPlayingArea.Left(), (m_cyClient - Prm.GoalWidth) / 2, m_pPlayingArea.Left() + 40,
            //        m_cyClient - (m_cyClient - Prm.GoalWidth) / 2);
            ctx.strokeStyle = "rgb(255, 0, 0)";
            ctx.strokeRect(this.m_pPlayingArea.Left(), (this.m_cyClient - ParamLoader.GoalWidth) / 2, 40, ParamLoader.GoalWidth);

            //    gdi.BluePen();
            //    gdi.Rect(m_pPlayingArea.Right(), (m_cyClient - Prm.GoalWidth) / 2, m_pPlayingArea.Right() - 40,
            //        m_cyClient - (m_cyClient - Prm.GoalWidth) / 2);

            //    //render the pitch markings
            //    gdi.WhitePen();
            //    gdi.Circle(m_pPlayingArea.Center(), m_pPlayingArea.Width() * 0.125);
            //    gdi.Line(m_pPlayingArea.Center().x, m_pPlayingArea.Top(), m_pPlayingArea.Center().x, m_pPlayingArea.Bottom());
            //    gdi.WhiteBrush();
            //    gdi.Circle(m_pPlayingArea.Center(), 2.0);


            //    //the ball
            //    gdi.WhitePen();
            //    gdi.WhiteBrush();
            this.m_pBall.Render(ctx);

            //Render the teams
            this.m_pRedTeam.Render(ctx);
            this.m_pBlueTeam.Render(ctx);

            //    //render the walls
            //    gdi.WhitePen();
            for (let w = 0; w < this.m_vecWalls.length; ++w) {
                this.m_vecWalls[w].Render(ctx);
            }

            //    //show the score
            //    gdi.TextColor(Cgdi.red);
            //    gdi.TextAtPos((m_cxClient / 2) - 50, m_cyClient - 18,
            //        "Red: " + ttos(m_pBlueGoal.NumGoalsScored()));

            //    gdi.TextColor(Cgdi.blue);
            //    gdi.TextAtPos((m_cxClient / 2) + 10, m_cyClient - 18,
            //        "Blue: " + ttos(m_pRedGoal.NumGoalsScored()));

            return true;
        }

        //    public void TogglePause() {
        //    m_bPaused = !m_bPaused;
        //}

        //    public boolean Paused() {
        //    return m_bPaused;
        //}

        //    public int cxClient() {
        //    return m_cxClient;
        //}

        //    public int cyClient() {
        //    return m_cyClient;
        //}

        public GoalKeeperHasBall() {
            return this.m_bGoalKeeperHasBall;
        }

        public SetGoalKeeperHasBall(b: boolean) {
            this.m_bGoalKeeperHasBall = b;
        }

        public PlayingArea() {
            return this.m_pPlayingArea;
        }

        //    public List < Wall2D > Walls() {
        //    return m_vecWalls;
        //}

        public Ball() {
            return this.m_pBall;
        }

        public GetRegionFromIndex(idx: number) {
            //assert((idx >= 0) && (idx < (int) m_Regions.size()));
            return this.m_Regions[idx];
        }

        public GameOn() {
            return this.m_bGameOn;
        }

        public SetGameOn() {
            this.m_bGameOn = true;
        }

        public SetGameOff() {
            this.m_bGameOn = false;
        }

        /**
         ** this instantiates the regions the players utilize to  position
         ** themselves
        */
        private CreateRegions(width: number, height: number) {
            //index into the vector
            let m_Regions = this.m_Regions;
            let idx = m_Regions.length - 1;

            for (let col = 0; col < this.NumRegionsHorizontal; ++col) {
                for (let row = 0; row < this.NumRegionsVertical; ++row) {
                    m_Regions[idx] = new Region(
                        this.PlayingArea().Left() + col * width,
                        this.PlayingArea().Top() + row * height,
                        this.PlayingArea().Left() + (col + 1) * width,
                        this.PlayingArea().Top() + (row + 1) * height,
                        idx);
                    --idx;
                }
            }
        }

    }
}