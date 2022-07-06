import React from "react";
import styled from "styled-components";
import { atom, useAtom, useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

if (SITE === 'server') {
  console.log('server')
}

if (SITE === 'client') {
  console.log('client');
}

const countAtom = atom(0);
const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  color: "red",
});

const Title = styled.h1({
  textAlign: 'center',
  fontSize: 40
});

function Content() {
  const [count] = useAtom(countAtom);
  const setCount = useSetAtom(countAtom);

  return (
    <Container>
      <Title>{count}</Title>
      <button onClick={() => setCount(count + 1)}>累加</button>
    </Container>
  );
}

export default function App({countFromServer}: {countFromServer?: number}) {
  // 在顶部将服务端的数据注入到 jotai 中
  useHydrateAtoms([[countAtom, countFromServer ?? 1]])
  
  return <Content />
}
