
var robots = {};
var mainRobotId;

var Robot = function(robot) {
  mainRobotId = robot.id;
};

function goToWall(robot) {
  robot.ignore("onScannedRobot");
  robot.log(JSON.stringify(robot));
  
  var minimumAngle = function(currentAngle, targetAngle) {
    if (currentAngle > targetAngle+180) 
      return 360 + targetAngle - currentAngle;
    else
      return targetAngle - currentAngle;
  };
  
  var walls = {
    "up": {"rotateAngle": minimumAngle(robot.angle,0), "stepCount":(robot.position.y)},
		"right": {"rotateAngle":minimumAngle(robot.angle,90), "stepCount":(robot.arenaWidth - robot.position.x)},
		"down": {"rotateAngle":minimumAngle(robot.angle,180), "stepCount":(robot.arenaHeight - robot.position.y)},
		"left": {"rotateAngle":minimumAngle(robot.angle,270), "stepCount":(robot.position.x)},
	};

	var distance = function(wall) {
		return Math.abs(wall.rotateAngle) + wall.stepCount;
	}

	walls.up.distance = distance(walls.up);
	walls.right.distance = distance(walls.right);
	walls.down.distance = distance(walls.down);
	walls.left.distance = distance(walls.left);

	var wall = walls.up;
  var prevWall = walls.left;
	for(var wall_ in walls) {
   		if (walls[wall_].distance < wall.distance)
      {
        prevWall = wall;
   			wall = walls[wall_];
      }
	}
  
  if (robot.parentId != null)
  {
    wall = prevWall;
  }
	
  robot.log(JSON.stringify(wall));
  
  if (robot.availableClones > 0) {
    robot.clone();
  }
  
	robot.turn(wall.rotateAngle);
	robot.ahead(wall.stepCount);
  robot.listen("onScannedRobot");
};

Robot.prototype.onIdle = function(ev) {
  var r = ev.robot;
  
  if (robots[r.id] == null) {
    robots[r.id] = {scanDirection: 1};
    goToWall(r);
  }
  
  if (r.cannonRelativeAngle > 269) {
    robots[r.id].scanDirection = -1;
  } else if (r.cannonRelativeAngle < 91) {
    robots[r.id].scanDirection = 1;
  }
  
  r.ahead(10);
  r.rotateCannon(10*robots[r.id].scanDirection, r.id);
};

Robot.prototype.onScannedRobot = function(ev) {
  var r = ev.robot;
  
  if (ev.scannedRobot.parentId == mainRobotId || 
      ev.scannedRobot.id == mainRobotId) {
        return;
  };
  
  r.fire();
  r.rotateCannon(-robots[r.id].scanDirection*25);
};

Robot.prototype.onWallCollision = function(ev) {
	var r = ev.robot;
	r.ignore("onScannedRobot");
	r.turn(90);
  r.listen("onScannedRobot");
};

Robot.prototype.onHitByBullet = function(ev) {
  var r = ev.robot;
  
  if (r.availableDisappears > 0) {
    r.disappear();
  }
};

Robot.prototype.onRobotCollision = function(ev) {
    var robot = ev.robot;
    robot.back(20);
  	goToWall(robot);
};
