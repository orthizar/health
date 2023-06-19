import { Flex } from "./styles/flex";

export default function Header () {
  return (
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
      <h1>Health of Silvan Kohler</h1>
    </Flex>
  );
}