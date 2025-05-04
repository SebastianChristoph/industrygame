import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { PRODUCTION_RECIPES } from "../config/resources";
import { getResourceImageWithFallback } from "../config/resourceImages";
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
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ScienceIcon from '@mui/icons-material/Science';

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
  onCompleteMission,
  allConditionsMet
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

                  // Resource-Icon nur für PRODUCE_RESOURCE und PRODUCTION_RATE
                  let resourceIcon = null;
                  if (
                    (cond.type === "PRODUCE_RESOURCE" || cond.type === "PRODUCTION_RATE") &&
                    cond.resourceId
                  ) {
                    const iconCandidates = getResourceImageWithFallback(cond.resourceId, "icon");
                    // Wir nehmen das erste Bild, das existiert (vereinfachte Annahme, dass das erste passt)
                    resourceIcon = (
                      <img
                        src={iconCandidates[0]}
                        alt={cond.resourceId}
                        style={{
                          width: 22,
                          height: 22,
                          marginRight: 6,
                          verticalAlign: "middle",
                          filter: done ? "grayscale(0)" : "grayscale(0.7)",
                          opacity: done ? 1 : 0.7,
                        }}
                        onError={e => { e.target.onerror = null; e.target.src = "/images/icons/placeholder.png"; }}
                      />
                    );
                  }

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
                      {resourceIcon}
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
            {/* Rewards unterhalb der Bedingungen anzeigen */}
            {mission.rewards && (
              <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(20,40,20,0.18)', borderRadius: 1, display: 'inline-block' }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                  Reward{Object.keys(mission.rewards).length > 1 ? 's' : ''}:
                </Typography>
                {mission.rewards.credits && (
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MonetizationOnIcon sx={{ color: '#ffd600', fontSize: 20, mr: 1 }} />
                    {mission.rewards.credits} Credits
                  </Typography>
                )}
                {mission.rewards.researchPoints && (
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon sx={{ color: '#90caf9', fontSize: 20, mr: 1 }} />
                    {mission.rewards.researchPoints} Research Points
                  </Typography>
                )}
              </Box>
            )}
            {/* Button zum Abschließen der Mission, wenn alle Bedingungen erfüllt */}
            {allConditionsMet && !isCompleted && (
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2, fontWeight: 700, fontSize: '1.1rem', px: 4, py: 1.2 }}
                onClick={onCompleteMission}
              >
                Complete Mission
              </Button>
            )}
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
  const missions = useSelector((state) => state.game.missions) || { data: {}, completedMissionIds: [] };
  const [selectedMission, setSelectedMission] = React.useState(null);
  const [showCompletionDialog, setShowCompletionDialog] = React.useState(false);
  const gameState = useSelector(state => state.game);
  const [pendingCompletion, setPendingCompletion] = React.useState(false);

  // Ermittle die aktive oder nächste verfügbare Mission
  let currentMission = null;
  if (missions?.activeMissionId) {
    currentMission = missions.data?.[missions.activeMissionId];
  } else {
    currentMission = Object.values(missions.data || {})
      .filter(
        (m) =>
          typeof m === "object" &&
          m.id &&
          !missions.completedMissionIds?.includes(m.id)
      )
      .sort((a, b) => (a.chapter || 0) - (b.chapter || 0))[0];
  }

  const handleActivateMission = (missionId) => {
    dispatch(activateMission(missionId));
  };

  // Hilfsfunktion: Sind alle Bedingungen erfüllt?
  const allConditionsMet = currentMission && currentMission.conditions && currentMission.conditions.every(cond => {
    switch (cond.type) {
      case "PRODUCE_RESOURCE": {
        const resource = gameState.resources[cond.resourceId];
        return resource && resource.amount >= cond.amount;
      }
      case "PRODUCTION_RATE": {
        const totalPerPing = getResourceProductionPerPing(gameState, cond.resourceId);
        return totalPerPing >= cond.rate;
      }
      case "RESEARCH_TECH":
        return gameState.researchedTechnologies.includes(cond.technologyId);
      case "UNLOCK_MODULE":
        return gameState.unlockedModules.includes(cond.moduleId);
      case "TOTAL_BALANCE":
      case "CREDITS":
        return gameState.credits >= cond.amount;
      default:
        return false;
    }
  });

  // Mission abschließen: Zeige Modal, Rewards erst nach Bestätigung auszahlen
  const handleCompleteMission = () => {
    setPendingCompletion(true);
  };

  // Rewards wirklich auszahlen und nächste Mission aktivieren
  const handleClaimRewards = () => {
    if (!currentMission) return;
    // Rewards vergeben
    if (currentMission.rewards) {
      if (currentMission.rewards.credits) {
        dispatch({ type: 'game/spendCredits', payload: -currentMission.rewards.credits });
      }
      if (currentMission.rewards.researchPoints) {
        dispatch({ type: 'game/addResearchPoints', payload: currentMission.rewards.researchPoints });
      }
      // Handle resource rewards
      if (currentMission.rewards.resources) {
        Object.entries(currentMission.rewards.resources).forEach(([resourceId, amount]) => {
          dispatch({ type: 'game/addResource', payload: { resourceId, amount } });
        });
      }
      // Handle module unlock
      if (currentMission.rewards.unlockModule) {
        dispatch({ type: 'game/unlockModule', payload: currentMission.rewards.unlockModule });
      }
    }
    // Mission abschließen
    dispatch(completeMission(currentMission.id));
    // Nächste Mission aktivieren (falls vorhanden)
    const allMissions = Object.values(missions.data || {});
    const nextMission = allMissions
      .filter(m => typeof m === 'object' && m.id && !missions.completedMissionIds.includes(m.id) && m.id !== currentMission.id)
      .sort((a, b) => (a.chapter || 0) - (b.chapter || 0))[0];
    if (nextMission) {
      dispatch(activateMission(nextMission.id));
    }
    setPendingCompletion(false);
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
            onCompleteMission={handleCompleteMission}
            allConditionsMet={allConditionsMet}
            onClick={() => handleMissionClick(currentMission)}
          />
        </Box>
      ) : (
        <Typography variant="body1">All missions completed!</Typography>
      )}

      {/* Completion Modal: Zeige completionText und Rewards, Auszahlung erst beim Schließen */}
      <Dialog open={pendingCompletion} onClose={() => setPendingCompletion(false)} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#232b2f",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 12,
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: "#232b2f", color: "#fff", fontWeight: 800 }}>
          Mission Complete
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#232b2f" }}>
          <DialogContentText sx={{ whiteSpace: 'pre-line', color: '#fff', mb: 2 }}>
            {currentMission?.completionText?.replace(/^"|"$/g, '')}
          </DialogContentText>
          {currentMission?.rewards && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(20,40,20,0.18)', borderRadius: 1, display: 'inline-block' }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                Rewards:
              </Typography>
              {currentMission.rewards.credits && (
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonetizationOnIcon sx={{ color: '#ffd600', fontSize: 20, mr: 1 }} />
                  {currentMission.rewards.credits} Credits
                </Typography>
              )}
              {currentMission.rewards.researchPoints && (
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScienceIcon sx={{ color: '#90caf9', fontSize: 20, mr: 1 }} />
                  {currentMission.rewards.researchPoints} Research Points
                </Typography>
              )}
              {currentMission.rewards.resources && Object.entries(currentMission.rewards.resources).map(([resourceId, amount]) => (
                <Typography key={resourceId} variant="body2" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img
                    src={getResourceImageWithFallback(resourceId, "icon")[0]}
                    alt={resourceId}
                    style={{ width: 20, height: 20, marginRight: 8 }}
                    onError={e => { e.target.onerror = null; e.target.src = "/images/icons/placeholder.png"; }}
                  />
                  {amount} {resourceId.charAt(0).toUpperCase() + resourceId.slice(1)}
                </Typography>
              ))}
              {currentMission.rewards.unlockModule && (
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img
                    src="/images/icons/module.png"
                    alt="module"
                    style={{ width: 20, height: 20, marginRight: 8 }}
                    onError={e => { e.target.onerror = null; e.target.src = "/images/icons/placeholder.png"; }}
                  />
                  Unlock {currentMission.rewards.unlockModule.charAt(0).toUpperCase() + currentMission.rewards.unlockModule.slice(1)} Module
                </Typography>
              )}
              {currentMission.rewards.passiveBonus && currentMission.rewards.passiveBonus.type === 'production_speed' && (
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img
                    src="/images/icons/speed.png"
                    alt="speed"
                    style={{ width: 20, height: 20, marginRight: 8 }}
                    onError={e => { e.target.onerror = null; e.target.src = "/images/icons/placeholder.png"; }}
                  />
                  +{(currentMission.rewards.passiveBonus.value * 100).toFixed(0)}% Production Speed
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#232b2f" }}>
          <Button onClick={handleClaimRewards} variant="contained" color="success" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Claim Rewards
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Missions;
