"use client";

import React, { useState } from "react";
import { TrashIcon, PencilIcon, CheckIcon, XMarkIcon, PlusIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Product } from "@/generated/prisma";
import CreateProductModal from "./CreateProductModal";

export const ProductsTable = ({ products }: { products: Product[] }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedProducts, setEditedProducts] = useState<Record<string, Partial<Product>>>({});
  const [productsState, setProductsState] = useState<Product[]>(products);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleEditing = () => setEditing((e) => !e);

  const handleChange = (
    productId: string,
    field: keyof Product,
    value: Product[keyof Product]
  ) => {
    setEditedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    const updates = Object.entries(editedProducts);

    for (const [productId, updatedFields] of updates) {
      try {
        const res = await fetch(`/api/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields),
        });
        if (!res.ok) continue;

        setProductsState((prev) =>
          prev.map((p) => (p.productId === productId ? { ...p, ...updatedFields } : p))
        );
      } catch (err) {
        console.error(`Error updating product ${productId}:`, err);
      }
    }

    setEditing(false);
    setEditedProducts({});
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!res.ok) return;
      setProductsState((prev) => prev.filter((p) => p.productId !== productId));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleProductCreated = (newProduct: Product) => {
    setProductsState((prev) => [...prev, newProduct]);
  };

  return (
    <div>
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProductCreated={handleProductCreated}
      />

      {/* Header / Controls */}
      <div className="flex gap-2 items-center pb-5">
        <h2 className="text-2xl font-semibold">Products</h2>

        {/* Chevron toggle */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          aria-controls="ad-table-panel"
          className="p-1 rounded hover:bg-base-200 transition"
          title={expanded ? "Collapse" : "Expand"}
        >
          <ChevronDownIcon className={`w-7 h-7 transition-transform ${expanded ? "rotate-180" : ""}`}/>
        </button>
        {expanded &&
          (editing ? (
            <>
              <button className="btn btn-secondary w-1/6 self-center" onClick={toggleEditing}>
                Cancel <XMarkIcon className="h-4 w-4" />
              </button>
              <button
                className="btn btn-secondary w-1/6 self-center"
                onClick={() => setShowCreateModal(true)}
              >
                Create <PlusIcon className="h-4 w-4" />
              </button>
              <button className="btn btn-secondary w-1/6 self-center" onClick={handleSave}>
                Save <CheckIcon className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button className="btn btn-secondary w-1/6 self-center" onClick={toggleEditing}>
              Edit <PencilIcon className="h-4 w-4" />
            </button>
          ))}
      </div>
        {/* Only render table when expanded */}
        {expanded && (
          <div className="overflow-x-auto w-full">
            <table className="w-full border border-base-content text-sm">
              <thead className="bg-base-200">
                <tr>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Price</th>
                  <th className="border px-2 py-1">Category</th>
                  <th className="border px-2 py-1">Stripe Price ID</th>
                  <th className="border px-2 py-1">Product ID</th>
                  {editing && <th className="border px-2 py-1">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {productsState
                  .sort((a, b) => a.price - b.price)
                  .map((product) => {
                    const isEdited = editedProducts[product.productId];
                    return (
                      <tr key={product.productId}>
                        <td className="border px-2 py-1">
                          {editing ? (
                            <input
                              value={isEdited?.name ?? product.name}
                              onChange={(e) =>
                                handleChange(product.productId, "name", e.target.value)
                              }
                            />
                          ) : (
                            product.name
                          )}
                        </td>
                        <td className="border px-2 py-1">
                          {editing ? (
                            <input
                              type="number"
                              value={isEdited?.price ?? product.price}
                              onChange={(e) =>
                                handleChange(
                                  product.productId,
                                  "price",
                                  parseInt(e.target.value || "0", 10)
                                )
                              }
                            />
                          ) : (
                            `$${(product.price / 100).toFixed(2)}`
                          )}
                        </td>
                        <td className="border px-2 py-1">
                          {editing ? (
                            <input
                              value={isEdited?.category ?? product.category}
                              onChange={(e) =>
                                handleChange(product.productId, "category", e.target.value)
                              }
                            />
                          ) : (
                            product.category
                          )}
                        </td>
                        <td className="border px-2 py-1">
                          {editing ? (
                            <input
                              value={isEdited?.priceId ?? product.priceId}
                              onChange={(e) =>
                                handleChange(product.productId, "priceId", e.target.value)
                              }
                            />
                          ) : (
                            product.priceId
                          )}
                        </td>
                        <td className="border px-2 py-1">{product.productId}</td>
                        {editing && (
                          <td className="border px-2 py-1">
                            <button
                              className="btn btn-error btn-xs"
                              onClick={() => handleDelete(product.productId)}
                            >
                              Delete <TrashIcon className="h-4 w-4 ml-1" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
  );
};

export default ProductsTable;