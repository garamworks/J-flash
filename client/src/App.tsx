import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FlashcardPage from "@/pages/flashcard";
import GrammarFlashcardPage from "@/pages/grammar-flashcard";
import ExpressionFlashcardPage from "@/pages/expression-flashcard";
import HomePage from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/flashcard" component={FlashcardPage} />
      <Route path="/grammar-flashcard" component={GrammarFlashcardPage} />
      <Route path="/expression-flashcard" component={ExpressionFlashcardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
