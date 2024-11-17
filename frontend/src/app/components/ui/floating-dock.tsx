"use client";
import { cn } from "@/lib/utils";
import { IconHome, IconChartBar, IconChartPie, IconRobot } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

const navItems = [
  { title: "Home", icon: <IconHome className="h-5 w-5" />, href: "/" },
  { title: "Choose", icon: <IconChartBar className="h-5 w-5" />, href: "/get-started" },
  { title: "Analyze", icon: <IconChartPie className="h-5 w-5" />, href: "/dashboard" },
  { title: "Generate", icon: <IconRobot className="h-5 w-5" />, href: "/generate" },
];

export const FloatingDock = () => {
  let mouseY = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center rounded-full bg-white/90 dark:bg-zinc-800/90 py-4 backdrop-blur-sm shadow-lg"
    >
      {navItems.map((item, index) => (
        <IconContainer mouseY={mouseY} key={item.title} {...item} index={index} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseY,
  title,
  icon,
  href,
  index,
}: {
  mouseY: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  index: number;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseY, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  let heightSync = useTransform(distance, [-100, 0, 100], [40, 52, 40]);
  let height = useSpring(heightSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      style={{ height }}
      className="relative aspect-square my-1"
    >
      <Link href={href}>
        <motion.div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700 transition-colors duration-200"
        >
          {icon}
        </motion.div>
      </Link>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            className="absolute top-1/2 -translate-y-1/2 left-14 rounded-md bg-gray-800 dark:bg-white px-2 py-1 text-xs font-medium text-white dark:text-gray-800 shadow-lg whitespace-nowrap"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}