import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { PRODUCTION_RECIPES } from "../config/resources";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { activateMission, completeMission } from "../store/gameSlice";

// Hilfsfunktion: Produktion pro Ping für eine Ressource berechnen
function getResourceProductionPerPing(gameState, resourceId) {
  let total = 0;
  Object.entries(gameState.productionConfigs).forEach(([lineId, config]) => {
    const status = gameState.productionStatus[lineId];
    if (!config?.recipe || !status?.isActive) return;
    const recipe = PRODUCTION_RECIPES[config.recipe];
    if (recipe.output.resourceId === resourceId) {
      total += recipe.output.amount / recipe.productionTime;
    }
  });
  return total;
}

const MissionCard = ({
  mission,
  onActivate,
  onComplete,
  isActive,
  isCompleted,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const gameState = useSelector((state) => state.game);

  // Hilfsfunktion: Status einer Bedingung prüfen
  const getConditionStatus = (condition) => {
    switch (condition.type) {
      case "PRODUCE_RESOURCE": {
        const resource = gameState.resources[condition.resourceId];
        return resource && resource.amount >= condition.amount;
      }
      case "PRODUCTION_RATE": {
        // Use the new helper function for total production per ping
        const totalPerPing = getResourceProductionPerPing(gameState, condition.resourceId);
        return totalPerPing >= condition.rate;
      }
      case "RESEARCH_TECH":
        return gameState.researchedTechnologies.includes(
          condition.technologyId
        );
      case "UNLOCK_MODULE":
        return gameState.unlockedModules.includes(condition.moduleId);
      case "TOTAL_BALANCE":
      case "CREDITS":
        return gameState.credits >= condition.amount;
      default:
        return false;
    }
  };

  // Hilfsfunktion: Fortschrittstext für PRODUCE_RESOURCE und PRODUCTION_RATE
  const getConditionProgress = (condition) => {
    if (condition.type === "PRODUCE_RESOURCE") {
      const resource = gameState.resources[condition.resourceId];
      const current = resource ? resource.amount : 0;
      return ` (${current}/${condition.amount})`;
    }
    if (condition.type === "PRODUCTION_RATE") {
      const current = getResourceProductionPerPing(gameState, condition.resourceId);
      // Finde den Ressourcennamen
      let resourceName = condition.resourceId;
      if (gameState.resources && gameState.resources[condition.resourceId] && gameState.resources[condition.resourceId].name) {
        resourceName = gameState.resources[condition.resourceId].name;
      }
      return ` (Current: ${current.toFixed(2)} ${resourceName} / ping)`;
    }
    return "";
  };

  return (
    <Card
      sx={{
        width: "100%",
        boxShadow: 6,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: isActive ? `2px solid ${theme.palette.primary.main}` : "none",
        background: "rgba(30,30,30,0.85)",
        color: "#fff",
        "&:hover": {
          boxShadow: 10,
        },
      }}
    >
      {/* Flex-Container für Bild und Text */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
        }}
      >
        <Box
          sx={{ width: { xs: "100%", sm: 600 }, maxWidth: 600, flexShrink: 0 }}
        >
          <CardMedia
            component="img"
            image={mission.image}
            alt={mission.title}
            sx={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              background: "#222",
              mb: { xs: 2, sm: 0 },
            }}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            pl: { xs: 0, sm: 3 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 0 }}>
            <Typography
              gutterBottom
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700 }}
            >
              <span
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  textShadow: "0 2px 8px #000",
                }}
              >
                {mission.title}
              </span>
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, color: "#fff" }}
            >
              {mission.description}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "#fff" }}
            >
              Mission Objectives
            </Typography>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              {mission.conditions &&
                mission.conditions.map((cond, idx) => {
                  const done = getConditionStatus(cond);
                  return (
                    <li
                      key={idx}
                      style={{
                        marginBottom: 8,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {done ? (
                        <CheckCircleIcon
                          color="inherit"
                          fontSize="small"
                          sx={{ mr: 1, color: "#fff" }}
                        />
                      ) : (
                        <HourglassEmptyIcon
                          color="inherit"
                          fontSize="small"
                          sx={{ mr: 1, color: "#fff" }}
                        />
                      )}
                      <span
                        style={{
                          color: done ? theme.palette.success.main : undefined,
                          fontWeight: done ? 600 : 400,
                        }}
                      >
                        {cond.description || cond.type}
                        {getConditionProgress(cond)}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </CardContent>
        </Box>
      </Box>
    </Card>
  );
};

const Missions = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const missions = useSelector((state) => state.game.missions);
  const [selectedMission, setSelectedMission] = React.useState(null);
  const [showCompletionDialog, setShowCompletionDialog] = React.useState(false);

  // Ermittle die aktive oder nächste verfügbare Mission
  let currentMission = null;
  if (missions.activeMissionId) {
    currentMission = missions.data[missions.activeMissionId];
  } else {
    currentMission = Object.values(missions.data || {})
      .filter(
        (m) =>
          typeof m === "object" &&
          m.id &&
          !missions.completedMissionIds.includes(m.id)
      )
      .sort((a, b) => (a.chapter || 0) - (b.chapter || 0))[0];
  }

  const handleActivateMission = (missionId) => {
    dispatch(activateMission(missionId));
  };

  const handleCompleteMission = (missionId) => {
    dispatch(completeMission(missionId));
    setShowCompletionDialog(false);
  };

  const handleMissionClick = (mission) => {
    setSelectedMission(mission);
    if (mission.isCompleted) {
      setShowCompletionDialog(true);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        width: "100%",
        minHeight: "95vh",
        overflowX: "hidden",
        boxSizing: "border-box",
        backgroundImage: "url(/images/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 900,
          fontSize: "2.5rem",
          color: "#fff",
          textShadow: "0 2px 8px #000, 0 1px 1px #000",
          //   background: 'rgba(30,30,30,0.7)',
          px: 2,
          py: 1,
          borderRadius: 2,
          width: "fit-content",
        }}
      >
        Missions
      </Typography>

      {currentMission ? (
        <Box sx={{ mb: 4, width: "100%" }}>
          <MissionCard
            mission={currentMission}
            onActivate={handleActivateMission}
            onComplete={handleCompleteMission}
            isActive={currentMission.id === missions.activeMissionId}
            isCompleted={missions.completedMissionIds.includes(
              currentMission.id
            )}
            onClick={() => handleMissionClick(currentMission)}
          />
        </Box>
      ) : (
        <Typography variant="body1">All missions completed!</Typography>
      )}

      <Dialog
        open={showCompletionDialog}
        onClose={() => setShowCompletionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedMission && (
          <>
            <DialogTitle>
              Mission completed: {selectedMission.title}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {selectedMission.completionText}
              </DialogContentText>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Rewards:
                </Typography>
                {selectedMission.rewards?.credits && (
                  <Typography variant="body2">
                    • {selectedMission.rewards.credits} Credits
                  </Typography>
                )}
                {selectedMission.rewards?.researchPoints && (
                  <Typography variant="body2">
                    • {selectedMission.rewards.researchPoints} Research Points
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowCompletionDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Missions;
