import React from "react";
import { Switch, Text, useTheme } from "@nextui-org/react";
import { Flex } from "./styles/flex";
import { useTheme as useNextTheme } from 'next-themes'
import { DarkMode, LightMode } from "@mui/icons-material";

export default function Header() {
  const { setTheme } = useNextTheme();
  const { isDark, type } = useTheme();
  return (
    <div>
      <Switch
        checked={isDark}
        onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
        icon={isDark ? <DarkMode /> : <LightMode />}
        size='xs'
      />
      <Flex
        direction={'column'}
        align={'center'}
        css={{
          'pt': '$20',
          'px': '$6',
          '@md': {
            px: '$64',
          },
        }}
      >
        <Text h1>Health of Silvan Kohler</Text>
      </Flex>
    </div>
  );
}