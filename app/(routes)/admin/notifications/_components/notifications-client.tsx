"use client";

import {
  createNotification,
  deleteNotification,
  getAllNotifications,
} from "@/app/actions/notifications";
import { getUsers } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

type NotificationWithUser = {
  id: number;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

type UserOption = {
  id: string;
  name: string;
  avatarUrl: string;
};

interface NotificationsClientProps {
  initialData: {
    notifications: NotificationWithUser[];
    totalPages: number;
    totalCount: number;
  };
}

const PAGE_SIZES = [5, 10, 20, 50, 100];

export function NotificationsClient({ initialData }: NotificationsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState(initialData.notifications);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<NotificationWithUser | null>(null);

  const [users, setUsers] = useState<UserOption[]>([]);
  const [formData, setFormData] = useState({
    userId: "",
    message: "",
  });

  useEffect(() => {
    if (createDialogOpen && users.length === 0) {
      startTransition(async () => {
        const data = await getUsers(1, 1000);
        setUsers(
          data.users.map((u) => ({
            id: u.id,
            name: u.name,
            avatarUrl: u.avatarUrl,
          })),
        );
      });
    }
  }, [createDialogOpen, users.length]);

  const fetchData = (page: number, limit: number) => {
    startTransition(async () => {
      const data = await getAllNotifications(page, limit);
      setNotifications(data.notifications);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
    });
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value);
    setPageSize(newSize);
    fetchData(1, newSize);
  };

  const handleCreate = () => {
    startTransition(async () => {
      await createNotification({
        userId: formData.userId,
        message: formData.message,
      });
      setCreateDialogOpen(false);
      setFormData({
        userId: "",
        message: "",
      });
      fetchData(currentPage, pageSize);
    });
  };

  const handleDelete = () => {
    if (!notificationToDelete) return;
    startTransition(async () => {
      await deleteNotification(notificationToDelete.id);
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
      fetchData(currentPage, pageSize);
    });
  };

  const openDeleteDialog = (notification: NotificationWithUser) => {
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista powiadomień</CardTitle>
              <CardDescription>
                Łącznie {totalCount} powiadomień
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Na stronie:
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Wyślij powiadomienie
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Wyślij powiadomienie</DialogTitle>
                    <DialogDescription>
                      Wybierz użytkownika i wpisz treść powiadomienia.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="user">Użytkownik</Label>
                      <Select
                        value={formData.userId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, userId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz użytkownika" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="h-5 w-5 rounded-full"
                                  width={20}
                                  height={20}
                                />
                                {user.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">Treść</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Treść powiadomienia..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Anuluj
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={
                        isPending || !formData.userId || !formData.message
                      }
                    >
                      {isPending ? "Wysyłanie..." : "Wyślij"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Brak powiadomień w bazie danych
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Odbiorca</TableHead>
                  <TableHead>Tytuł</TableHead>
                  <TableHead>Treść</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow
                    key={notification.id}
                    className={isPending ? "opacity-50" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Image
                          src={notification.user.avatarUrl}
                          alt={notification.user.name}
                          className="h-6 w-6 rounded-full object-cover"
                          width={24}
                          height={24}
                        />
                        <span className="font-medium">
                          {notification.user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {notification.title}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {notification.message}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          notification.read
                            ? "bg-gray-100 text-gray-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {notification.read ? "Przeczytane" : "Nieprzeczytane"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(notification.createdAt).toLocaleString("pl-PL")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(notification)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Strona {currentPage} z {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchData(currentPage - 1, pageSize)}
                  disabled={currentPage === 1 || isPending}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchData(currentPage + 1, pageSize)}
                  disabled={currentPage === totalPages || isPending}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń powiadomienie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć to powiadomienie?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
