import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private db: AngularFirestore) {}

  getActiveProducts(userId: string): Observable<Product[]> {
    return this.db
      .collection<Product>(`products`, (ref) =>
        ref.where('userId', '==', userId).where('active', '==', true)
      )
      .valueChanges();
  }

  updateProductByProductId(product: string, updateData: any): void {
    this.db.doc<Product>(`products/${product}`).update(updateData);
  }
}
