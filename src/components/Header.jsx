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
  MonetizationOn as MoneyIcon,
  ShoppingCart as ExpensesIcon,
  AccountBalance as BalanceIcon,
  Paid as CreditsIcon
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
    <AppBar 
      position="static" 
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography 
          variant="h1" 
          sx={{ 
            flexGrow: 1,
            fontSize: '1.5rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            color: 'primary.main'
          }}
        >
          Fabrik-Imperium-Simulator
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <PingIndicator />
          
          <Tooltip title="Einnahmen pro Ping">
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1.5,
                px: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'success.dark',
                border: 1,
                borderColor: 'success.main'
              }}
            >
              <MoneyIcon sx={{ color: 'success.light' }} />
              <Typography 
                variant="body2"
                sx={{ 
                  color: 'success.light',
                  fontWeight: 500
                }}
              >
                +{income}
              </Typography>
            </Paper>
          </Tooltip>

          <Tooltip title="Ausgaben pro Ping">
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1.5,
                px: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'error.dark',
                border: 1,
                borderColor: 'error.main'
              }}
            >
              <ExpensesIcon sx={{ color: 'error.light' }} />
              <Typography 
                variant="body2"
                sx={{ 
                  color: 'error.light',
                  fontWeight: 500
                }}
              >
                -{expenses}
              </Typography>
            </Paper>
          </Tooltip>

          <Tooltip title="Bilanz pro Ping">
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1.5,
                px: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: balance >= 0 ? 'success.dark' : 'error.dark',
                border: 1,
                borderColor: balance >= 0 ? 'success.main' : 'error.main'
              }}
            >
              <BalanceIcon sx={{ color: balance >= 0 ? 'success.light' : 'error.light' }} />
              <Typography 
                variant="body2"
                sx={{ 
                  color: balance >= 0 ? 'success.light' : 'error.light',
                  fontWeight: 500
                }}
              >
                {balance >= 0 ? '+' : ''}{balance}
              </Typography>
            </Paper>
          </Tooltip>

          <Tooltip title="Aktuelles Guthaben">
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1.5,
                px: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'primary.dark',
                border: 1,
                borderColor: 'primary.main'
              }}
            >
              <CreditsIcon sx={{ color: 'primary.light' }} />
              <Typography 
                variant="body2"
                sx={{ 
                  color: 'primary.light',
                  fontWeight: 500
                }}
              >
                ${credits}
              </Typography>
            </Paper>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 