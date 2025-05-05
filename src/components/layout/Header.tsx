import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  Avatar
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  TextFields as TextFieldsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppTheme } from '../../context/ThemeContext';
import DynamicTypography from '../common/DynamicTypography';

// Importez votre logo ici
import LogoImage from '../../assets/images/CashCrowLogo.png';

const Header: React.FC = () => {
  const theme = useTheme();
  const { 
    mode, 
    toggleColorMode, 
    animationIntensity, 
    setAnimationIntensity,
    typographyScale,
    setTypographyScale
  } = useAppTheme();
  
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpen = Boolean(settingsAnchorEl);
  
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };
  
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'transparent', 
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {/* Logo carré */}
          <Avatar
            src={LogoImage}
            sx={{ 
              width: 54, 
              height: 54, 
              mr: 2,
              bgcolor: theme.palette.primary.main,
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
            }}
            alt="CashCrow Logo"
          >
            {/* Si vous n'avez pas d'image, utilisez les initiales */}
            CC
          </Avatar>
          
          {/* Tagline avec animation différée */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.8, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Typography 
              variant="subtitle2" 
              color="text.secondary"
              sx={{ ml: 2, fontStyle: 'italic' }}
            >
              Mind the gaps. We fill the books.
            </Typography>
          </motion.div>
        </motion.div>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={mode === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}>
            <IconButton 
              onClick={toggleColorMode} 
              color="inherit"
              sx={{ mr: 1 }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Paramètres d'affichage">
            <IconButton
              onClick={handleSettingsClick}
              color="inherit"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={settingsAnchorEl}
            open={settingsOpen}
            onClose={handleSettingsClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem sx={{ display: 'block', minWidth: 200 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <SpeedIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Intensité des animations
              </Typography>
              <Box sx={{ pl: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      size="small" 
                      checked={animationIntensity === 'low'} 
                      onChange={() => setAnimationIntensity('low')}
                    />
                  }
                  label="Faible"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      size="small" 
                      checked={animationIntensity === 'medium'} 
                      onChange={() => setAnimationIntensity('medium')}
                    />
                  }
                  label="Moyenne"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      size="small" 
                      checked={animationIntensity === 'high'} 
                      onChange={() => setAnimationIntensity('high')}
                    />
                  }
                  label="Élevée"
                />
              </Box>
            </MenuItem>
            
            <Divider />
            
            <MenuItem sx={{ display: 'block' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <TextFieldsIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Échelle de typographie
              </Typography>
              <Box sx={{ pl: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      size="small" 
                      checked={typographyScale === 'normal'} 
                      onChange={() => setTypographyScale('normal')}
                    />
                  }
                  label="Normale"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      size="small" 
                      checked={typographyScale === 'bold'} 
                      onChange={() => setTypographyScale('bold')}
                    />
                  }
                  label="Audacieuse"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      size="small" 
                      checked={typographyScale === 'extra-bold'} 
                      onChange={() => setTypographyScale('extra-bold')}
                    />
                  }
                  label="Très audacieuse"
                />
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
