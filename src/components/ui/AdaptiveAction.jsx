import { memo } from 'react';
import { useCognitiveState } from '../../hooks/useCognitiveState';
import Button from './Button/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default memo(function AdaptiveAction({ 
  children, 
  priority = 'secondary', // 'primary', 'secondary', 'tertiary'
  hideOnOverload = false,
  ...props 
}) {
  const { cognitiveState } = useCognitiveState();

  let isHidden = false;
  let currentPriority = priority;
  let opacity = 1;

  if (cognitiveState === 'fatigue') {
    if (hideOnOverload) isHidden = true;
    else if (priority !== 'primary') {
      currentPriority = 'secondary';
      opacity = 0.5;
    }
  }

  if (cognitiveState === 'friction') {
    if (priority !== 'primary') isHidden = true;
  }

  return (
    <AnimatePresence mode="popLayout">
      {!isHidden && (
        <motion.div
          key="adaptive-action"
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: opacity, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <Button variant={currentPriority} {...props}>
            {children}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
