
import { Container, Tab, Tabs } from "@mui/material";
import {  useState } from "react";
import { LearnPage } from "./pages/learn";
import { ListPage } from "./pages/list";


enum Pages {
  list = 'list',
  learn = 'learn'
}

function App() {
  const [page, setPage] = useState<Pages>(Pages.list)

  return (
    <Container>
        <Tabs value={page} onChange={(e, v) => setPage(v)}>
        <Tab label="List" value={Pages.list}></Tab>
        <Tab label="Learn" value={Pages.learn}></Tab>
      </Tabs>

      {page === Pages.list && <ListPage></ListPage>}
      {page === Pages.learn && <LearnPage></LearnPage>}
    </Container>
  );
}

export default App;
