<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'long_description',
        'min_price',
        'max_price',
        'status',
        'type',
    ];

    public function brands()
    {
        return $this->belongsToMany(Brand::class, 'brand_product');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_product');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    // SCOPES for fast filtering
    public function scopeActive($query)
    {
        return $query->where('status', 'published');
    }
}
