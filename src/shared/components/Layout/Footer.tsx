/**
 * Footer Component
 * Fixed footer with copyright information and i18n support
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 */

import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {t('footer.copyright', { year: currentYear })}
      </Typography>
    </Box>
  );
};

export default Footer;
