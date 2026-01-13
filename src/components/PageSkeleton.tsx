import React from 'react';
import { Box, Skeleton } from '@mui/material';

const PageSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="rectangular" height={200} />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width="60%" />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="95%" />
      </Box>
    </Box>
  );
};

export default PageSkeleton;
