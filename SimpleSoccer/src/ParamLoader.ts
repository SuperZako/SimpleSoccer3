/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer;

//import common.misc.iniFileLoaderBase;
//import java.io.IOException;
namespace SimpleSoccer {
    export class ParamLoader {
        static GoalWidth = 100;


        //use to set up the sweet spot calculator
        static NumSweetSpotsX = 13;
        static NumSweetSpotsY = 6;

        /**/static NumSupportSpotsX = 13;
        /**/static NumSupportSpotsY = 6

        //these values tweak the various rules used to calculate the support spots
        static Spot_CanPassScore = 2.0;
        /**/static Spot_PassSafeScore = 2.0;
        static Spot_CanScoreFromPositionScore = 1.0;
        static Spot_DistFromControllingPlayerScore = 2.0
        static Spot_ClosenessToSupportingPlayerScore = 0.0;
        static Spot_AheadOfAttackerScore = 0.0;

        //how many times per second the support spots will be calculated
        static SupportSpotUpdateFreq = 1;

        //the chance a player might take a random pot shot at the goal
        static ChancePlayerAttemptsPotShot = 0.005;

        //this is the chance that a player will receive a pass using the arrive
        //steering behavior, rather than Pursuit
        static ChanceOfUsingArriveTypeReceiveBehavior = 0.5;

        static BallSize = 5.0;
        static BallMass = 1.0;
        static Friction = -0.015;

        //the goalkeeper has to be this close to the ball to be able to interact with it
        static KeeperInBallRange = 10.0;
        static KeeperInBallRangeSq = 10.0 * 10.0;
        static PlayerInTargetRange = 10.0;
        static PlayerInTargetRangeSq = 10.0 * 10.0;

        //player has to be this close to the ball to be able to kick it. The higher
        //the value this gets, the easier it gets to tackle. 
        static PlayerKickingDistance = 6.0 + 5.0;
        //static PlayerKickingDistance   += BallSize;
        static PlayerKickingDistanceSq = (6.0 + 5.0) * (6.0 + 5.0);

        //the number of times a player can kick the ball per second
        static PlayerKickFrequency = 8;
        static PlayerMass = 3.0;
        static PlayerMaxForce = 1.0;
        static PlayerMaxSpeedWithBall = 1.2;
        static PlayerMaxSpeedWithoutBall = 1.6;
        static PlayerMaxTurnRate = 0.4;
        static PlayerScale = 1.0;

        //when an opponents comes within this range the player will attempt to pass
        //the ball. Players tend to pass more often, the higher the value
        static PlayerComfortZone = 60.0;
        static PlayerComfortZoneSq = 60.0 * 60.0;
        //in the range zero to 1.0. adjusts the amount of noise added to a kick,
        //the lower the value the worse the players get.
        static PlayerKickingAccuracy = 0.99;

        //the number of times the SoccerTeam::CanShoot method attempts to find
        //a valid shot
        static NumAttemptsToFindValidStrike = 5;

        static MaxDribbleForce = 1.5;
        static MaxShootingForce = 6.0;
        static MaxPassingForce = 3.0;


        //the distance away from the center of its home region a player
        //must be to be considered at home
        static WithinRangeOfHome = 15.0;

        //how close a player must get to a sweet spot before he can change state
        static WithinRangeOfSweetSpot = 15.0;

        //the minimum distance a receiving player must be from the passing player
        static MinPassDistance = 120.0;
        //the minimum distance a player must be from the goalkeeper before it will
        //pass the ball
        static GoalkeeperMinPassDistance = 50.0;

        //this is the distance the keeper puts between the back of the net 
        //and the ball when using the interpose steering behavior
        static GoalKeeperTendingDistance = 20.0;

        //when the ball becomes within this distance of the goalkeeper he
        //changes state to intercept the ball
        static GoalKeeperInterceptRange = 100.0;
        static GoalKeeperInterceptRangeSq = 100.0 * 100.0;
        //how close the ball must be to a receiver before he starts chasing it
        static BallWithinReceivingRange = 10.0;
        static BallWithinReceivingRangeSq = 10.0 * 10.0;
        //these (boolean) values control the amount of player and pitch info shown
        //1=ON; 0=OFF
        static ViewStates = 1;
        static ViewIDs = 1;
        static ViewSupportSpots = 1;
        static ViewRegions = 0;
        static bShowControllingTeam = 1;
        static ViewTargets = 0;
        static HighlightIfThreatened = 0;

        //simple soccer's physics are calculated using each tick as the unit of time
        //so changing this will adjust the speed
        static FrameRate = 60;


        //--------------------------------------------steering behavior stuff
        static SeparationCoefficient = 10.0;

        //how close a neighbour must be to be considered for separation
        static ViewDistance = 30.0;

        //1=ON; 0=OFF
        static bNonPenetrationConstraint = 0;

        //  public final static ParamLoader Prm;

        //  static {
        //      try {
        //          Prm = new ParamLoader();
        //      } catch (IOException ex) {
        //          throw new RuntimeException(ex);
        //      }
        //  }

        //  public static ParamLoader Instance() {
        //      return Prm;
        //  }

        //  private ParamLoader() throws IOException {
        //      super(ParamLoader.class.getResourceAsStream("Params.ini"));
        //      GoalWidth                   = GetNextParameterDouble(); 

        //  NumSupportSpotsX            = GetNextParameterInt();    
        //  NumSupportSpotsY            = GetNextParameterInt();  

        //  Spot_PassSafeScore                     = GetNextParameterDouble();
        //  Spot_CanScoreFromPositionScore         = GetNextParameterDouble();
        //  Spot_DistFromControllingPlayerScore     = GetNextParameterDouble();
        //  Spot_ClosenessToSupportingPlayerScore  = GetNextParameterDouble();
        //  Spot_AheadOfAttackerScore              = GetNextParameterDouble();

        //  SupportSpotUpdateFreq       = GetNextParameterDouble(); 

        //  ChancePlayerAttemptsPotShot = GetNextParameterDouble();
        //  ChanceOfUsingArriveTypeReceiveBehavior = GetNextParameterDouble();

        //  BallSize                    = GetNextParameterDouble();    
        //  BallMass                    = GetNextParameterDouble();    
        //  Friction                    = GetNextParameterDouble(); 

        //  KeeperInBallRange           = GetNextParameterDouble();    
        //  PlayerInTargetRange         = GetNextParameterDouble(); 
        //  PlayerKickingDistance       = GetNextParameterDouble(); 
        //  PlayerKickFrequency         = GetNextParameterDouble();


        //  PlayerMass                  = GetNextParameterDouble(); 
        //  PlayerMaxForce              = GetNextParameterDouble();    
        //  PlayerMaxSpeedWithBall      = GetNextParameterDouble();   
        //  PlayerMaxSpeedWithoutBall   = GetNextParameterDouble();   
        //  PlayerMaxTurnRate           = GetNextParameterDouble();   
        //  PlayerScale                 = GetNextParameterDouble();      
        //  PlayerComfortZone           = GetNextParameterDouble();  
        //  PlayerKickingAccuracy       = GetNextParameterDouble();

        //  NumAttemptsToFindValidStrike = GetNextParameterInt();



        //  MaxDribbleForce             = GetNextParameterDouble();    
        //  MaxShootingForce            = GetNextParameterDouble();    
        //  MaxPassingForce             = GetNextParameterDouble();  

        //  WithinRangeOfHome           = GetNextParameterDouble();    
        //  WithinRangeOfSupportSpot    = GetNextParameterDouble();    

        //  MinPassDist                 = GetNextParameterDouble();
        //  GoalkeeperMinPassDist       = GetNextParameterDouble();

        //  GoalKeeperTendingDistance   = GetNextParameterDouble();    
        //  GoalKeeperInterceptRange    = GetNextParameterDouble();
        //  BallWithinReceivingRange    = GetNextParameterDouble();

        //  bStates                     = GetNextParameterBool();    
        //  bIDs                        = GetNextParameterBool(); 
        //  bSupportSpots               = GetNextParameterBool();     
        //  bRegions                    = GetNextParameterBool();
        //  bShowControllingTeam        = GetNextParameterBool();
        //  bViewTargets                = GetNextParameterBool();
        //  bHighlightIfThreatened      = GetNextParameterBool();

        //  FrameRate                   = GetNextParameterInt();

        //  SeparationCoefficient       = GetNextParameterDouble(); 
        //  ViewDistance                = GetNextParameterDouble(); 
        //  bNonPenetrationConstraint   = GetNextParameterBool(); 


        //  BallWithinReceivingRangeSq = BallWithinReceivingRange * BallWithinReceivingRange;
        //  KeeperInBallRangeSq      = KeeperInBallRange * KeeperInBallRange;
        //  PlayerInTargetRangeSq    = PlayerInTargetRange * PlayerInTargetRange;   
        //  PlayerKickingDistance   += BallSize;
        //  PlayerKickingDistanceSq  = PlayerKickingDistance * PlayerKickingDistance;
        //  PlayerComfortZoneSq      = PlayerComfortZone * PlayerComfortZone;
        //  GoalKeeperInterceptRangeSq     = GoalKeeperInterceptRange * GoalKeeperInterceptRange;
        //  WithinRangeOfSupportSpotSq = WithinRangeOfSupportSpot * WithinRangeOfSupportSpot;
        //  }

        //public double GoalWidth;

        //public int   NumSupportSpotsX;
        //public int   NumSupportSpotsY;

        ////these values tweak the various rules used to calculate the support spots
        //public double Spot_PassSafeScore;
        //public double Spot_CanScoreFromPositionScore;
        //public double Spot_DistFromControllingPlayerScore;
        //public double Spot_ClosenessToSupportingPlayerScore;
        //public double Spot_AheadOfAttackerScore;  

        //public double SupportSpotUpdateFreq ;

        //public double ChancePlayerAttemptsPotShot; 
        //public double ChanceOfUsingArriveTypeReceiveBehavior;

        //public double BallSize;
        //public double BallMass;
        //public double Friction;

        //public double KeeperInBallRange;
        //public double KeeperInBallRangeSq;

        //public double PlayerInTargetRange;
        //public double PlayerInTargetRangeSq;

        //public double PlayerMass;

        ////max steering force
        //public double PlayerMaxForce; 
        //public double PlayerMaxSpeedWithBall;
        //public double PlayerMaxSpeedWithoutBall;
        //public double PlayerMaxTurnRate;
        //public double PlayerScale;
        //public double PlayerComfortZone;

        //public double PlayerKickingDistance;
        //public double PlayerKickingDistanceSq;

        //public double PlayerKickFrequency; 

        //public double  MaxDribbleForce;
        //public double  MaxShootingForce;
        //public double  MaxPassingForce;

        //public double  PlayerComfortZoneSq;

        ////in the range zero to 1.0. adjusts the amount of noise added to a kick,
        ////the lower the value the worse the players get
        //public double  PlayerKickingAccuracy;

        ////the number of times the SoccerTeam::CanShoot method attempts to find
        ////a valid shot
        //public int    NumAttemptsToFindValidStrike;

        ////the distance away from the center of its home region a player
        ////must be to be considered at home
        //public double WithinRangeOfHome;

        ////how close a player must get to a sweet spot before he can change state
        //public double WithinRangeOfSupportSpot;
        //public double WithinRangeOfSupportSpotSq;


        ////the minimum distance a receiving player must be from the passing player
        //public double   MinPassDist;
        //public double   GoalkeeperMinPassDist;

        ////this is the distance the keeper puts between the back of the net
        ////and the ball when using the interpose steering behavior
        //public double  GoalKeeperTendingDistance;

        ////when the ball becomes within this distance of the goalkeeper he
        ////changes state to intercept the ball
        //public double  GoalKeeperInterceptRange;
        //public double  GoalKeeperInterceptRangeSq;

        ////how close the ball must be to a receiver before he starts chasing it
        //public double  BallWithinReceivingRange;
        //public double  BallWithinReceivingRangeSq;


        ////these values control what debug info you can see
        //public boolean  bStates;
        //public boolean  bIDs;
        //public boolean  bSupportSpots;
        //public boolean  bRegions;
        //public boolean  bShowControllingTeam;
        //public boolean  bViewTargets;
        //public boolean  bHighlightIfThreatened;

        //public int FrameRate;


        //public double SeparationCoefficient;

        ////how close a neighbour must be before an agent perceives it
        //public double ViewDistance;

        ////zero this to turn the constraint off
        //public boolean bNonPenetrationConstraint;
    }
}
