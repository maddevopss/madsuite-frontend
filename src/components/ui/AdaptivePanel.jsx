import { memo } from 'react';
import { useCognitiveState } from '../../hooks/useCognitiveState';
import { motion, AnimatePresence } from 'framer-motion';

export default memo(function AdaptivePanel({ 
  children, 
  hideOnOverload = false, 
  hideOnProcrastination = false,
  showOnlyOnHyperfocus = false,
  ...props
}) {
  const { cognitiveState } = useCognitiveState();

  let isHidden = false;
  if (cognitiveState === 'fatigue' && hideOnOverload) isHidden = true;
  if (cognitiveState === 'friction' && hideOnProcrastination) isHidden = true;
  if (showOnlyOnHyperfocus && cognitiveState !== 'deep_focus') isHidden = true;

  return (
    <AnimatePresence mode="wait">
      {!isHidden && (
        <motion.div
          key="adaptive-panel"
          initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
          animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
