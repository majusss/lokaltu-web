"use client";

import {
  createAchievement,
  deleteAchievement,
  getAchievements,
} from "@/app/actions/achievements";
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
import { Input } from "@/components/ui/input";
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
import { useState, useTransition } from "react";

type AchievementWithCount = {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  points: number;
  _count: {
    users: number;
  };
};

interface AchievementsClientProps {
  initialData: {
    achievements: AchievementWithCount[];
    totalPages: number;
    totalCount: number;
  };
}

const PAGE_SIZES = [5, 10, 20, 50, 100];

export function AchievementsClient({ initialData }: AchievementsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [achievements, setAchievements] = useState(initialData.achievements);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] =
    useState<AchievementWithCount | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iconUrl: "",
    points: "",
  });

  const fetchData = (page: number, limit: number) => {
    startTransition(async () => {
      const data = await getAchievements(page, limit);
      setAchievements(data.achievements);
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
      await createAchievement({
        name: formData.name,
        description: formData.description,
        iconUrl: formData.iconUrl,
        points: parseInt(formData.points),
      });
      setCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        iconUrl: "",
        points: "",
      });
      fetchData(currentPage, pageSize);
    });
  };

  const handleDelete = () => {
    if (!achievementToDelete) return;
    startTransition(async () => {
      await deleteAchievement(achievementToDelete.id);
      setDeleteDialogOpen(false);
      setAchievementToDelete(null);
      fetchData(currentPage, pageSize);
    });
  };

  const openDeleteDialog = (achievement: AchievementWithCount) => {
    setAchievementToDelete(achievement);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista osiągnięć</CardTitle>
              <CardDescription>Łącznie {totalCount} osiągnięć</CardDescription>
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
                    Dodaj osiągnięcie
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dodaj osiągnięcie</DialogTitle>
                    <DialogDescription>
                      Wypełnij formularz aby dodać nowe osiągnięcie.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nazwa</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Nazwa osiągnięcia"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Opis</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Opis osiągnięcia"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="points">Punkty</Label>
                      <Input
                        id="points"
                        type="number"
                        value={formData.points}
                        onChange={(e) =>
                          setFormData({ ...formData, points: e.target.value })
                        }
                        placeholder="100"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="iconUrl">URL ikony</Label>
                      <Input
                        id="iconUrl"
                        value={formData.iconUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, iconUrl: e.target.value })
                        }
                        placeholder="https://..."
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
                    <Button onClick={handleCreate} disabled={isPending}>
                      {isPending ? "Dodawanie..." : "Dodaj"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Brak osiągnięć w bazie danych
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ikona</TableHead>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Opis</TableHead>
                  <TableHead>Punkty</TableHead>
                  <TableHead>Zdobyte przez</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements.map((achievement) => (
                  <TableRow
                    key={achievement.id}
                    className={isPending ? "opacity-50" : ""}
                  >
                    <TableCell>
                      <Image
                        src={achievement.iconUrl}
                        alt={achievement.name}
                        className="h-10 w-10 rounded-md object-cover"
                        width={40}
                        height={40}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {achievement.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {achievement.description}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                        {achievement.points} pkt
                      </span>
                    </TableCell>
                    <TableCell>
                      {achievement._count.users} użytkowników
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(achievement)}
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
            <DialogTitle>Usuń osiągnięcie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć osiągnięcie &quot;
              {achievementToDelete?.name}&quot;?
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
