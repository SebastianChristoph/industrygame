import React from 'react';
import { useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tooltip,
  Paper
} from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon
} from '@mui/icons-material';
import { PRODUCTION_RECIPES, RESOURCES, OUTPUT_TARGETS, INPUT_SOURCES } from '../config/resources';
import { PingIndicator } from './PingIndicator';

const Header = () => {
  const credits = useSelector(state => state.game.credits);
  const productionLines = useSelector(state => state.game.productionLines);
  const productionConfigs = useSelector(state => state.game.productionConfigs);
  const productionStatus = useSelector(state => state.game.productionStatus);

  // Berechne Einnahmen und Ausgaben pro Ping
  const calculateBalance = () => {
    let income = 0;
    let expenses = 0;

    productionLines.forEach(line => {
      const config = productionConfigs[line.id];
      const status = productionStatus[line.id];
      
      if (!config?.recipe || !status?.isActive) return;

      const recipe = PRODUCTION_RECIPES[config.recipe];
      const outputResource = RESOURCES[recipe.output.resourceId];
      
      // Berechne Kosten für Inputs
      recipe.inputs.forEach((input, index) => {
        const inputConfig = config.inputs[index];
        if (inputConfig?.source === INPUT_SOURCES.PURCHASE_MODULE) {
          const resource = RESOURCES[input.resourceId];
          expenses += (resource.basePrice * input.amount) / recipe.productionTime;
        }
      });

      // Berechne Einnahmen aus Verkäufen
      if (config.outputTarget === OUTPUT_TARGETS.AUTO_SELL) {
        income += (outputResource.basePrice * recipe.output.amount) / recipe.productionTime;
      }
    });

    return {
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      balance: Math.round((income - expenses) * 100) / 100
    };
  };

  const { income, expenses, balance } = calculateBalance();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Industry Game
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <PingIndicator />
          
          <Tooltip title="Einnahmen pro Ping">
            <Paper elevation={0} sx={{ 
              p: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              bgcolor: 'success.light',
              color: 'success.contrastText'
            }}>
              <IncomeIcon />
              <Typography variant="body2">
                +{income}/Ping
              </Typography>
            </Paper>
          </Tooltip>

          <Tooltip title="Ausgaben pro Ping">
            <Paper elevation={0} sx={{ 
              p: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              bgcolor: 'error.light',
              color: 'error.contrastText'
            }}>
              <ExpenseIcon />
              <Typography variant="body2">
                -{expenses}/Ping
              </Typography>
            </Paper>
          </Tooltip>

          <Tooltip title="Bilanz pro Ping">
            <Paper elevation={0} sx={{ 
              p: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              bgcolor: balance >= 0 ? 'success.light' : 'error.light',
              color: balance >= 0 ? 'success.contrastText' : 'error.contrastText'
            }}>
              <BalanceIcon />
              <Typography variant="body2">
                {balance >= 0 ? '+' : ''}{balance}/Ping
              </Typography>
            </Paper>
          </Tooltip>

          <Tooltip title="Aktuelles Guthaben">
            <Paper elevation={0} sx={{ 
              p: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              bgcolor: 'primary.light',
              color: 'primary.contrastText'
            }}>
              <Typography variant="body2">
                {credits} Credits
              </Typography>
            </Paper>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 