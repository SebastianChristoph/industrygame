import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Card, CardContent, useMediaQuery } from '@mui/material';
import { RESOURCES, PRODUCTION_RECIPES } from '../config/resources';
import { MODULES } from '../config/modules';
import { RESEARCH_TREE } from '../config/research';
import { useTheme } from '@mui/material/styles';
import { getResourceImageWithFallback } from '../config/resourceImages';

// ResourceIcon component (copy from ProductionLine)
const PLACEHOLDER_ICON = '/images/icons/placeholder.png';
const ResourceIcon = ({ iconUrls, alt, resourceId, ...props }) => {
  if (
    (alt && /research$/i.test(alt.trim())) ||
    (resourceId && /research(_points)?/i.test(resourceId))
  ) {
    return <img src="/images/icons/Research.png" alt={alt} {...props} />;
  }
  const [idx, setIdx] = React.useState(0);
  const handleError = () => {
    if (idx < iconUrls.length - 1) setIdx(idx + 1);
    else setIdx(-1);
  };
  if (!iconUrls || iconUrls.length === 0) return <img src={PLACEHOLDER_ICON} alt={alt} {...props} />;
  if (idx === -1) return <img src={PLACEHOLDER_ICON} alt={alt} {...props} />;
  return (
    <img
      src={iconUrls[idx]}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};

// Helper to find the research card (technology) that unlocks a given recipe
function findResearchCardAndModuleForRecipe(recipeId) {
  for (const module of Object.values(RESEARCH_TREE)) {
    for (const tech of Object.values(module.technologies)) {
      if (tech.unlocks?.recipes && tech.unlocks.recipes.includes(recipeId)) {
        return { researchCard: tech.name, module: module.name, moduleIcon: MODULES[module.id.toUpperCase()]?.icon };
      }
    }
  }
  return { researchCard: null, module: null, moduleIcon: null };
}

const Resources = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Sort resources by base price, but filter out 'research_points'
  const sortedResources = Object.values(RESOURCES)
    .filter(r => r.id !== 'research_points')
    .sort((a, b) => a.basePrice - b.basePrice);

  // Fallback: find which module a resource belongs to (old logic)
  const findResourceModule = (resourceId) => {
    for (const module of Object.values(MODULES)) {
      if (module.resources.includes(resourceId)) {
        return { name: module.name, icon: module.icon };
      }
    }
    return null;
  };

  // Helper function to find which recipe produces a resource
  const findRecipe = (resourceId) => PRODUCTION_RECIPES[resourceId];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Resources
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Here you can find an overview of all available resources in the game, including their recipes, selling values, and required research cards.
      </Typography>
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sortedResources.map((resource) => {
            const recipe = findRecipe(resource.id);
            const { researchCard, module, moduleIcon } = recipe ? findResearchCardAndModuleForRecipe(recipe.id) : { researchCard: null, module: null, moduleIcon: null };
            let displayModule = module;
            let displayModuleIcon = moduleIcon;
            if (!displayModule) {
              const fallback = findResourceModule(resource.id);
              if (fallback) {
                displayModule = fallback.name;
                displayModuleIcon = fallback.icon;
              }
            }
            return (
              <Card key={resource.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ResourceIcon
                      iconUrls={getResourceImageWithFallback(resource.id, 'icon')}
                      alt={resource.name + ' icon'}
                      resourceId={resource.id}
                      style={{ width: 32, height: 32, objectFit: 'contain', marginRight: 8 }}
                    />
                    <Typography variant="h6">{resource.name}</Typography>
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {resource.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'success.main' }}>Sell Value: {resource.basePrice}$</Typography>
                  <Typography variant="body2">Module: {displayModule ? (<span>{displayModuleIcon} {displayModule}</span>) : '-'}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Recipe: {recipe ? (
                      <span>
                        {recipe.inputs.map(input => (
                          <span key={input.resourceId}>
                            <ResourceIcon
                              iconUrls={getResourceImageWithFallback(input.resourceId, 'icon')}
                              alt={RESOURCES[input.resourceId]?.name + ' icon'}
                              resourceId={input.resourceId}
                              style={{ width: 20, height: 20, objectFit: 'contain', verticalAlign: 'middle', marginRight: 2 }}
                            />
                            {input.amount}
                            {input !== recipe.inputs[recipe.inputs.length - 1] && <span> + </span>}
                          </span>
                        ))}
                        <span> → </span>
                        <ResourceIcon
                          iconUrls={getResourceImageWithFallback(resource.id, 'icon')}
                          alt={resource.name + ' icon'}
                          resourceId={resource.id}
                          style={{ width: 20, height: 20, objectFit: 'contain', verticalAlign: 'middle', marginRight: 2 }}
                        />
                        {recipe.output.amount}
                        {` (${recipe.productionTime}P)`}
                      </span>
                    ) : '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Research Card: {researchCard ? researchCard : '-'}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Icon</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Sell Value</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Recipe (Pings)</TableCell>
                <TableCell>Research Card</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedResources.map((resource, index) => {
                const recipe = findRecipe(resource.id);
                const { researchCard, module, moduleIcon } = recipe ? findResearchCardAndModuleForRecipe(recipe.id) : { researchCard: null, module: null, moduleIcon: null };
                let displayModule = module;
                let displayModuleIcon = moduleIcon;
                if (!displayModule) {
                  const fallback = findResourceModule(resource.id);
                  if (fallback) {
                    displayModule = fallback.name;
                    displayModuleIcon = fallback.icon;
                  }
                }
                return (
                  <TableRow
                    key={resource.id}
                    sx={{ backgroundColor: index % 2 === 0 ? 'background.paper' : 'action.hover' }}
                  >
                    <TableCell>
                      <ResourceIcon
                        iconUrls={getResourceImageWithFallback(resource.id, 'icon')}
                        alt={resource.name + ' icon'}
                        resourceId={resource.id}
                        style={{ width: 28, height: 28, objectFit: 'contain' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={resource.description} arrow>
                        <span>{resource.name}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{resource.basePrice}$</TableCell>
                    <TableCell>{displayModule ? (<span>{displayModuleIcon} {displayModule}</span>) : '-'}</TableCell>
                    <TableCell>
                      {recipe ? (
                        <span>
                          {recipe.inputs.map(input => (
                            <span key={input.resourceId}>
                              <ResourceIcon
                                iconUrls={getResourceImageWithFallback(input.resourceId, 'icon')}
                                alt={RESOURCES[input.resourceId]?.name + ' icon'}
                                resourceId={input.resourceId}
                                style={{ width: 18, height: 18, objectFit: 'contain', verticalAlign: 'middle', marginRight: 2 }}
                              />
                              {input.amount}
                              {input !== recipe.inputs[recipe.inputs.length - 1] && <span> + </span>}
                            </span>
                          ))}
                          <span> → </span>
                          <ResourceIcon
                            iconUrls={getResourceImageWithFallback(resource.id, 'icon')}
                            alt={resource.name + ' icon'}
                            resourceId={resource.id}
                            style={{ width: 18, height: 18, objectFit: 'contain', verticalAlign: 'middle', marginRight: 2 }}
                          />
                          {recipe.output.amount}
                          {` (${recipe.productionTime}P)`}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {researchCard ? researchCard : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Resources; 