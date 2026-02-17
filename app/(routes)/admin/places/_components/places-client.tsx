"use client";

import {
  createPlace,
  deletePlace,
  getPlaces,
  updatePlace,
} from "@/app/actions/places";
import { getUploadUrl } from "@/app/actions/storage";
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
import { PlaceModel as Place } from "@/generated/prisma/models/Place";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";

interface PlacesClientProps {
  initialData: {
    places: Place[];
    totalPages: number;
    totalCount: number;
  };
}

const PAGE_SIZES = [5, 10, 20, 50, 100];

export function PlacesClient({ initialData }: PlacesClientProps) {
  const [isPending, startTransition] = useTransition();
  const [places, setPlaces] = useState(initialData.places);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState<Place | null>(null);
  const [placeToEdit, setPlaceToEdit] = useState<Place | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    category: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    category: "",
    description: "",
  });

  const fetchData = (page: number, limit: number) => {
    startTransition(async () => {
      const data = await getPlaces(page, limit);
      setPlaces(data.places);
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
      let imageKey = "";
      if (imageFile) {
        const { url, key } = await getUploadUrl(imageFile.type);
        await fetch(url, {
          method: "PUT",
          body: imageFile,
          headers: { "Content-Type": imageFile.type },
        });
        imageKey = key;
      }
      await createPlace({
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        category: formData.category,
        image: imageKey,
      });
      setCreateDialogOpen(false);
      setFormData({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        category: "",
      });
      setImageFile(null);
      fetchData(currentPage, pageSize);
    });
  };

  const handleDelete = () => {
    if (!placeToDelete) return;
    startTransition(async () => {
      await deletePlace(placeToDelete.id);
      setDeleteDialogOpen(false);
      setPlaceToDelete(null);
      fetchData(currentPage, pageSize);
    });
  };

  const openDeleteDialog = (place: Place) => {
    setPlaceToDelete(place);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (place: Place) => {
    setPlaceToEdit(place);
    setEditFormData({
      name: place.name,
      address: place.address,
      latitude: place.latitude.toString(),
      longitude: place.longitude.toString(),
      category: place.category,
      description:
        (place as Place & { description?: string }).description || "",
    });
    setEditImageFile(null);
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!placeToEdit) return;
    startTransition(async () => {
      let imageKey: string | undefined;
      if (editImageFile) {
        const { url, key } = await getUploadUrl(editImageFile.type);
        await fetch(url, {
          method: "PUT",
          body: editImageFile,
          headers: { "Content-Type": editImageFile.type },
        });
        imageKey = key;
      }
      await updatePlace(placeToEdit.id, {
        name: editFormData.name,
        address: editFormData.address,
        latitude: parseFloat(editFormData.latitude),
        longitude: parseFloat(editFormData.longitude),
        category: editFormData.category,
        description: editFormData.description || undefined,
        ...(imageKey ? { image: imageKey } : {}),
      });
      setEditDialogOpen(false);
      setPlaceToEdit(null);
      setEditImageFile(null);
      fetchData(currentPage, pageSize);
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista miejsc</CardTitle>
              <CardDescription>Łącznie {totalCount} miejsc</CardDescription>
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
                    Dodaj miejsce
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dodaj miejsce</DialogTitle>
                    <DialogDescription>
                      Wypełnij formularz aby dodać nowe miejsce na mapie.
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
                        placeholder="Nazwa miejsca"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Adres</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Adres miejsca"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="latitude">Szerokość geog.</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              latitude: e.target.value,
                            })
                          }
                          placeholder="51.1234"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="longitude">Długość geog.</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              longitude: e.target.value,
                            })
                          }
                          placeholder="17.1234"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Kategoria</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="np. restauracja, muzeum"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Zdjęcie</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setImageFile(e.target.files?.[0] ?? null)
                        }
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50 flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm transition-colors"
                      >
                        <ImagePlus className="h-6 w-6" />
                        <span>
                          {imageFile
                            ? imageFile.name
                            : "Kliknij, aby wybrać zdjęcie"}
                        </span>
                      </button>
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
          {places.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Brak miejsc w bazie danych
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zdjęcie</TableHead>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Współrzędne</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {places.map((place) => (
                  <TableRow
                    key={place.id}
                    className={isPending ? "opacity-50" : ""}
                  >
                    <TableCell>
                      <img
                        src={
                          place.image
                            ? `${process.env.NEXT_PUBLIC_CDN_URL}/${place.image}`
                            : ""
                        }
                        alt={place.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{place.name}</TableCell>
                    <TableCell>{place.address}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {place.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(place)}
                          disabled={isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(place)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
            <DialogTitle>Usuń miejsce</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć miejsce &quot;{placeToDelete?.name}
              &quot;?
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edytuj miejsce</DialogTitle>
            <DialogDescription>
              Edytuj dane miejsca &quot;{placeToEdit?.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nazwa</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Adres</Label>
              <Input
                id="edit-address"
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-lat">Szerokość</Label>
                <Input
                  id="edit-lat"
                  value={editFormData.latitude}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      latitude: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lng">Długość</Label>
                <Input
                  id="edit-lng"
                  value={editFormData.longitude}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      longitude: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Kategoria</Label>
              <Input
                id="edit-category"
                value={editFormData.category}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    category: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Opis</Label>
              <Input
                id="edit-description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Nowe zdjęcie (opcjonalne)</Label>
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => editFileInputRef.current?.click()}
                className="border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50 flex h-20 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm transition-colors"
              >
                <ImagePlus className="h-5 w-5" />
                <span>
                  {editImageFile
                    ? editImageFile.name
                    : "Kliknij, aby zmienić zdjęcie"}
                </span>
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
