// import React, { useEffect, useMemo, useState } from "react";
// import type { Product } from "./admin.types";

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   initial?: Product | null;
//   onSave: (payload: Omit<Product, "id" | "createdAt">) => Promise<void>;
// };

// // Minimal Input component used by the form
// type InputProps = {
//   label?: string;
//   value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   type?: string;
// };
// function Input({ label, value, onChange, type = "text" }: InputProps) {
//   return (
//     <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//       {label}
//       <input
//         value={value}
//         onChange={onChange}
//         type={type}
//         style={{
//           padding: 8,
//           borderRadius: 4,
//           border: "1px solid #ccc",
//           fontSize: 14,
//         }}
//       />
//     </label>
//   );
// }

// // Minimal Modal wrapper used by the form
// type ModalProps = {
//   open: boolean;
//   title?: React.ReactNode;
//   onClose?: () => void;
//   children?: React.ReactNode;
// };
// function Modal({ open, title, onClose, children }: ModalProps) {
//   if (!open) return null;
//   return (
//     <div
//       style={{
//         position: "fixed",
//         inset: 0,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "rgba(0,0,0,0.4)",
//         zIndex: 9999,
//       }}
//     >
//       <div
//         style={{
//           background: "#fff",
//           padding: 20,
//           borderRadius: 6,
//           minWidth: 320,
//           color: "black",
//           maxWidth: "90%",
//           boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: 12,
//           }}
//         >
//           <strong>{title}</strong>
//           <button
//             onClick={onClose}
//             style={{
//               border: "none",
//               background: "transparent",
//               cursor: "pointer",
//               fontSize: 16,
//             }}
//           >
//             ✕
//           </button>
//         </div>
//         <div>{children}</div>
//       </div>
//     </div>
//   );
// }

// export default function ProductFormModal({
//   open,
//   onClose,
//   initial,
//   onSave,
// }: Props) {
//   const isEdit = !!initial;

//   const [name, setName] = useState("");
//   const [brand, setBrand] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("0");
//   const [imageUrl, setImageUrl] = useState("");
//   const [sizesCsv, setSizesCsv] = useState("");
//   const [stockQty, setStockQty] = useState("0");

//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     if (!open) return;
//     setErr("");
//     setBusy(false);

//     setName(initial?.name ?? "");
//     setBrand(initial?.brand ?? "");
//     setDescription(initial?.description ?? "");
//     setPrice(String(initial?.price ?? 0));
//     setImageUrl(initial?.imageUrl ?? "");
//     setSizesCsv(initial?.sizesCsv ?? "7,8,9,10");
//     setStockQty(String(initial?.stockQty ?? 0));
//   }, [open, initial]);

//   const canSave = useMemo(() => {
//     return (
//       name.trim().length > 1 &&
//       brand.trim().length > 0 &&
//       Number(price) >= 0 &&
//       String(sizesCsv).trim().length > 0
//     );
//   }, [name, brand, price, sizesCsv]);

//   async function handleSave() {
//     setErr("");
//     if (!canSave) {
//       setErr("Fill Name, Brand, Sizes. Price must be >= 0.");
//       return;
//     }

//     setBusy(true);
//     try {
//       await onSave({
//         name: name.trim(),
//         brand: brand.trim(),
//         description: description.trim(),
//         price: Number(price),
//         imageUrl: imageUrl.trim() || "https://picsum.photos/seed/new/800/600",
//         sizesCsv: sizesCsv.trim(),
//         stockQty: Number(stockQty || 0),
//       });
//       onClose();
//     } catch (e: any) {
//       setErr(e?.err?.message || e?.message || "Save failed");
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <Modal
//       open={open}
//       title={isEdit ? "Edit Product" : "Add Product"}
//       onClose={onClose}
//     >
//       <div style={{ display: "grid", gap: 10 }}>
//         <Input
//           label="Name *"
//           value={name}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             setName(e.target.value)
//           }
//         />
//         <Input
//           label="Brand *"
//           value={brand}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             setBrand(e.target.value)
//           }
//         />
//         <Input
//           label="Description"
//           value={description}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             setDescription(e.target.value)
//           }
//         />
//         <Input
//           label="Price"
//           type="number"
//           value={price}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             setPrice(e.target.value)
//           }
//         />
//         <Input
//           label="Image URL"
//           value={imageUrl}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             setImageUrl(e.target.value)
//           }
//         />
//         <Input
//           label="Sizes CSV * (ex: 7,8,9,10)"
//           value={sizesCsv}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             setSizesCsv(e.target.value)
//           }
//         />
//         <Input
//           label="Stock Qty"
//           type="number"
//           value={stockQty}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             setStockQty(e.target.value)
//           }
//         />

//         {err ? (
//           <div style={{ color: "crimson", fontSize: 13 }}>{err}</div>
//         ) : null}

//         <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
//           <button
//             type="button"
//             onClick={onClose}
//             disabled={busy}
//             style={{
//               padding: "6px 12px",
//               background: "transparent",
//               border: "1px solid #ccc",
//               borderRadius: 4,
//               cursor: busy ? "not-allowed" : "pointer",
//             }}
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSave}
//             disabled={busy}
//             style={{
//               padding: "6px 12px",
//               background: "#007bff",
//               color: "#fff",
//               border: "none",
//               borderRadius: 4,
//               cursor: busy ? "not-allowed" : "pointer",
//             }}
//           >
//             {busy ? "Saving..." : "Save"}
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// }
