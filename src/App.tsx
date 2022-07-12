
import { Container, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { LearnPage } from "./pages/learn";
import { ListPage } from "./pages/list";
import { ParsingPage } from "./pages/parsing";


enum Pages {
  list = 'list',
  learn = 'learn',
  parsing = 'parsing'
}

function App() {
  const [page, setPage] = useState<Pages>(Pages.list)

  return (
    <Container>
      <Tabs value={page} onChange={(e, v) => setPage(v)}>
        <Tab label="List" value={Pages.list}></Tab>
        <Tab label="Learn" value={Pages.learn}></Tab>
        <Tab label="Parsing" value={Pages.parsing}></Tab>
      </Tabs>

      {page === Pages.list && <ListPage></ListPage>}
      {page === Pages.learn && <LearnPage></LearnPage>}
      {page === Pages.parsing && <ParsingPage></ParsingPage>}
    </Container>
  );
}

export default App;
