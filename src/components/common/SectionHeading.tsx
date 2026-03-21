import { motion } from 'framer-motion';

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">{eyebrow}</p> : null}
        <h2 className="mt-2 font-display text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm text-brand-gray">{description}</p> : null}
      </div>
      {action}
    </motion.div>
  );
}
