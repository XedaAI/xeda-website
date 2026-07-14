import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Mail, RefreshCw, Sparkles, Users, Download, Trash2, Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [subscriberSearch, setSubscriberSearch] = useState("");

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      (c.company?.toLowerCase() || "").includes(contactSearch.toLowerCase()) ||
      c.message.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (error || !roles || roles.length === 0) {
        toast({
          title: "Access denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        navigate("/auth");
        return;
      }

      setIsAdmin(true);
      fetchContacts();
      fetchSubscribers();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    checkAuthAndRole();

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching contacts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching subscribers",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportSubscribersCSV = () => {
    const headers = ["Email", "Status", "Subscribed At"];
    const csvContent = [
      headers.join(","),
      ...subscribers.map((s) =>
        [s.email, s.status, format(new Date(s.subscribed_at), "yyyy-MM-dd HH:mm:ss")].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handleUnsubscribe = async (subscriber: Subscriber) => {
    if (!confirm(`Remove ${subscriber.email} from the newsletter?`)) return;

    setDeletingId(subscriber.id);
    try {
      const { error } = await supabase.functions.invoke("unsubscribe-mailchimp", {
        body: { subscriberId: subscriber.id, email: subscriber.email },
      });

      if (error) throw error;

      setSubscribers((prev) => prev.filter((s) => s.id !== subscriber.id));
      toast({
        title: "Unsubscribed",
        description: `${subscriber.email} has been removed.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unsubscribe",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === subscribers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subscribers.map((s) => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkUnsubscribe = async () => {
    const selectedSubscribers = subscribers.filter((s) => selectedIds.has(s.id));
    if (selectedSubscribers.length === 0) return;

    if (!confirm(`Remove ${selectedSubscribers.length} subscriber(s) from the newsletter?`)) return;

    setIsBulkDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const subscriber of selectedSubscribers) {
      try {
        const { error } = await supabase.functions.invoke("unsubscribe-mailchimp", {
          body: { subscriberId: subscriber.id, email: subscriber.email },
        });
        if (error) throw error;
        successCount++;
      } catch {
        errorCount++;
      }
    }

    setSubscribers((prev) => prev.filter((s) => !selectedIds.has(s.id) || errorCount > 0));
    setSelectedIds(new Set());
    setIsBulkDeleting(false);

    if (errorCount > 0) {
      toast({
        title: "Partial success",
        description: `Removed ${successCount} subscriber(s). ${errorCount} failed.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Unsubscribed",
        description: `${successCount} subscriber(s) removed.`,
      });
    }

    fetchSubscribers();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">xeda.ai Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contacts" className="gap-2">
              <Mail className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="gap-2">
              <Users className="h-4 w-4" />
              Subscribers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Submissions
                  </CardTitle>
                  <CardDescription>
                    View all contact form submissions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchContacts} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {contacts.length === 0 ? "No contact submissions yet." : "No contacts match your search."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead className="max-w-xs">Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(contact.created_at), "MMM d, yyyy")}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(contact.created_at), "h:mm a")}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-primary hover:underline"
                              >
                                {contact.email}
                              </a>
                            </TableCell>
                            <TableCell>
                              {contact.company ? (
                                contact.company
                              ) : (
                                <Badge variant="secondary">N/A</Badge>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate" title={contact.message}>
                                {contact.message}
                              </p>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Newsletter Subscribers
                  </CardTitle>
                  <CardDescription>
                    {subscribers.length} total subscribers
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedIds.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkUnsubscribe}
                      disabled={isBulkDeleting}
                    >
                      {isBulkDeleting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete ({selectedIds.size})
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={exportSubscribersCSV} disabled={subscribers.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchSubscribers}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search subscribers..."
                      value={subscriberSearch}
                      onChange={(e) => setSubscriberSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                {filteredSubscribers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {subscribers.length === 0 ? "No newsletter subscribers yet." : "No subscribers match your search."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={selectedIds.size === filteredSubscribers.length && filteredSubscribers.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Subscribed</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubscribers.map((subscriber) => (
                          <TableRow key={subscriber.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(subscriber.id)}
                                onCheckedChange={() => toggleSelect(subscriber.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <a
                                href={`mailto:${subscriber.email}`}
                                className="text-primary hover:underline"
                              >
                                {subscriber.email}
                              </a>
                            </TableCell>
                            <TableCell>
                              <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                                {subscriber.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(subscriber.subscribed_at), "MMM d, yyyy")}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(subscriber.subscribed_at), "h:mm a")}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUnsubscribe(subscriber)}
                                disabled={deletingId === subscriber.id}
                              >
                                {deletingId === subscriber.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
