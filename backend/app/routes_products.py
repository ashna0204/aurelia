"""
Product catalog routes — CRUD for the spice/product catalog.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth import require_api_key
from app.database import get_db
from app.models import Product
from app.schemas import ProductCreate, ProductResponse, SuccessResponse

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("/", response_model=list[ProductResponse])
def list_products(
    active_only: bool = Query(True, description="Only show active products"),
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if active_only:
        query = query.filter(Product.is_active == True)
    return query.order_by(Product.sort_order, Product.name).all()


@router.get("/{slug}", response_model=ProductResponse)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=SuccessResponse, dependencies=[Depends(require_api_key)])
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    exists = db.query(Product).filter(Product.slug == data.slug).first()
    if exists:
        raise HTTPException(status_code=409, detail=f"Product with slug '{data.slug}' already exists")

    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return SuccessResponse(message=f"Product '{product.name}' created.", id=product.id)


@router.put("/{product_id}", response_model=ProductResponse, dependencies=[Depends(require_api_key)])
def update_product(product_id: int, data: ProductCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in data.model_dump().items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", response_model=SuccessResponse, dependencies=[Depends(require_api_key)])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False
    db.commit()
    return SuccessResponse(message=f"Product '{product.name}' deactivated.", id=product.id)
